// src/pages/citizen/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getComplaintStats, getMyComplaints } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Bell,
  Calendar,
  Star,
  Activity,
  Zap,
  Award,
  BarChart3,
  Eye,
  MessageCircle,
  ThumbsUp,
  HelpCircle,
  User  // ← Added missing User import
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Enhanced Stat Card
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Enhanced Recent Complaint Card
const RecentComplaintCard = ({ complaint, onClick }) => {
  const statusConfig = {
    pending: { label: 'Pending', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: Clock },
    assigned: { label: 'Assigned', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: User },
    in_progress: { label: 'In Progress', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Activity },
    resolved: { label: 'Resolved', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: AlertCircle }
  };
  
  const priorityConfig = {
    low: { label: 'Low', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
    medium: { label: 'Medium', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
    high: { label: 'High', bgColor: 'bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
    emergency: { label: 'Emergency', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' }
  };

  const StatusIcon = statusConfig[complaint.status]?.icon || Clock;
  const status = statusConfig[complaint.status] || statusConfig.pending;
  const priority = priorityConfig[complaint.priority] || priorityConfig.medium;

  return (
    <div 
      onClick={() => onClick(complaint.id)}
      className="group p-4 border border-gray-100 rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 hover:border-blue-200 bg-white"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
              #{complaint.id?.slice(-6) || 'N/A'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priority.bgColor} ${priority.textColor} ${priority.borderColor}`}>
              {priority.label}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {complaint.created_at ? formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true }) : 'Recently'}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bgColor} ${status.textColor}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md group-hover:shadow-xl transition-all`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </button>
);

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
    thisMonth: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadDashboardData();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Try to load real data, if fails use demo data
      let statsData, complaintsData;
      
      try {
        statsData = await getComplaintStats();
        complaintsData = await getMyComplaints();
      } catch (error) {
        console.log('Using demo data');
        // Demo data for testing
        statsData = {
          total: 12,
          inProgress: 3,
          resolved: 7,
          pending: 2,
          thisMonth: 4
        };
        complaintsData = [
          {
            id: 'CMP-001',
            title: 'Road Damage Near Main Market',
            description: 'The road is completely damaged and causing traffic issues',
            status: 'in_progress',
            priority: 'high',
            created_at: new Date().toISOString()
          },
          {
            id: 'CMP-002',
            title: 'Street Light Not Working',
            description: 'Street light in front of house number 123 is not working',
            status: 'assigned',
            priority: 'medium',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'CMP-003',
            title: 'Garbage Collection Issue',
            description: 'Garbage not collected for the past 3 days',
            status: 'resolved',
            priority: 'low',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      
      setStats(statsData);
      setRecentComplaints(complaintsData?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const resolutionRate = stats?.total > 0 
    ? Math.round(((stats?.resolved || 0) / stats?.total) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-6 text-white shadow-xl">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">
                {greeting === 'Good Morning' ? '🌅' : greeting === 'Good Afternoon' ? '☀️' : '🌙'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {greeting}, {user?.name?.split(' ')[0] || 'Citizen'}!
              </h1>
            </div>
            <p className="text-blue-100 text-sm">
              Here's what's happening with your complaints today
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/citizen/submit')}
            className="bg-white text-[#1E3A8A] hover:bg-gray-100 shadow-lg"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            File New Complaint
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Complaints" 
          value={stats?.total || 0} 
          icon={FileText}
          color="from-blue-500 to-blue-600"
          subtitle="All time"
        />
        <StatCard 
          title="Active Cases" 
          value={(stats?.inProgress || 0) + (stats?.pending || 0)} 
          icon={Activity}
          color="from-yellow-500 to-yellow-600"
          subtitle="In progress"
        />
        <StatCard 
          title="Resolved" 
          value={stats?.resolved || 0} 
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          subtitle="Successfully resolved"
        />
        <StatCard 
          title="Pending Action" 
          value={stats?.pending || 0} 
          icon={Clock}
          color="from-orange-500 to-orange-600"
          subtitle="Awaiting response"
        />
      </div>

      {/* Resolution Rate Bar */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Resolution Rate</p>
              <p className="text-2xl font-bold text-[#1E3A8A]">{resolutionRate}%</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${resolutionRate}%`,
                  background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.resolved || 0} out of {stats?.total || 1} complaints resolved
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Complaints */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md h-full">
            <div className="flex flex-row items-center justify-between border-b border-gray-100 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your latest complaints</p>
              </div>
              {recentComplaints.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/citizen/complaints')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
            <div className="p-5 pt-0">
              <div className="space-y-3">
                {recentComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">No complaints yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start by filing your first complaint</p>
                    <Button 
                      onClick={() => navigate('/citizen/submit')}
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Submit Your First Complaint
                    </Button>
                  </div>
                ) : (
                  recentComplaints.map((complaint) => (
                    <RecentComplaintCard 
                      key={complaint.id} 
                      complaint={complaint} 
                      onClick={(id) => navigate(`/citizen/complaint/${id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
            </div>
            <div className="p-5 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton 
                  icon={PlusCircle}
                  label="New Complaint"
                  onClick={() => navigate('/citizen/submit')}
                  color="from-blue-500 to-blue-600"
                />
                <QuickActionButton 
                  icon={Eye}
                  label="Track Status"
                  onClick={() => navigate('/citizen/complaints')}
                  color="from-purple-500 to-purple-600"
                />
                <QuickActionButton 
                  icon={Bell}
                  label="Notifications"
                  onClick={() => navigate('/citizen/notifications')}
                  color="from-pink-500 to-pink-600"
                />
                <QuickActionButton 
                  icon={HelpCircle}
                  label="Help Center"
                  onClick={() => console.log('Help')}
                  color="from-gray-500 to-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl shadow-md bg-gradient-to-br from-white to-blue-50/20">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">This Month</h2>
              </div>
            </div>
            <div className="p-5 pt-0 text-center">
              <div className="text-5xl font-bold text-[#1E3A8A]">
                {stats?.thisMonth || 0}
              </div>
              <p className="text-gray-500 text-sm mt-2">Complaints submitted</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Resolution Rate</span>
                  <span className="font-semibold text-[#1E3A8A]">{resolutionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${resolutionRate}%`, backgroundColor: '#3B82F6' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Card */}
          <div className="bg-white rounded-xl shadow-md bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  {resolutionRate >= 70 ? (
                    <Award className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Star className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  {resolutionRate >= 70 ? (
                    <>
                      <h3 className="font-semibold text-gray-900">Great Track Record! 🎉</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        You have an excellent {resolutionRate}% resolution rate. Keep it up!
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900">Pro Tip 💡</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Provide detailed descriptions and images for faster complaint resolution
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Need immediate help?</p>
                  <p className="text-xs text-gray-500">Call our helpline: 1800-123-4567</p>
                </div>
                <ThumbsUp className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;