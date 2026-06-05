// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDepartmentAnalytics } from '../../services/adminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  PieChart,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

// Enhanced Stat Card with animation
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, change }) => {
  const isPositive = change && change > 0;
  
  return (
    <div className="group bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
          {change && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(change)}% from last month
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-md group-hover:shadow-lg transition-all`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ percentage, size = 120, color = '#3B82F6' }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>{percentage}%</span>
          <p className="text-xs text-gray-500">Rate</p>
        </div>
      </div>
    </div>
  );
};

// Officer Performance Card
const OfficerCard = ({ officer }) => {
  const resolutionRate = officer.resolutionRate || 0;
  const isExcellent = resolutionRate >= 80;
  const isGood = resolutionRate >= 60 && resolutionRate < 80;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isExcellent ? 'bg-green-100' : isGood ? 'bg-blue-100' : 'bg-yellow-100'
        }`}>
          <span className={`font-semibold ${
            isExcellent ? 'text-green-600' : isGood ? 'text-blue-600' : 'text-yellow-600'
          }`}>
            {officer.name?.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{officer.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isExcellent ? 'bg-green-100 text-green-700' : 
              isGood ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {resolutionRate}% Rate
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {officer.assigned} assigned
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {officer.resolved} resolved
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              {officer.assigned - officer.resolved} pending
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${resolutionRate}%`,
              background: isExcellent ? '#10B981' : isGood ? '#3B82F6' : '#F59E0B'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Status Bar Component
const StatusBar = ({ label, count, total, color, bgColor }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        let data;
        try {
          data = await getDepartmentAnalytics();
        } catch (error) {
          console.log('Using demo data');
          // Demo data
          data = {
            total: 145,
            pending: 23,
            assigned: 18,
            inProgress: 32,
            resolved: 72,
            rejected: 0,
            resolutionRate: 68,
            thisMonth: 34,
            lastMonth: 28,
            officerPerformance: [
              { id: 1, name: 'Rajesh Kumar', assigned: 25, resolved: 18, resolutionRate: 72 },
              { id: 2, name: 'Priya Singh', assigned: 20, resolved: 16, resolutionRate: 80 },
              { id: 3, name: 'Amit Verma', assigned: 30, resolved: 22, resolutionRate: 73 },
              { id: 4, name: 'Neha Gupta', assigned: 18, resolved: 12, resolutionRate: 67 },
              { id: 5, name: 'Sanjay Mehta', assigned: 22, resolved: 14, resolutionRate: 64 }
            ],
            categoryDistribution: [
              { name: 'Roads', count: 35 },
              { name: 'Water', count: 28 },
              { name: 'Electricity', count: 32 },
              { name: 'Sanitation', count: 25 },
              { name: 'Others', count: 25 }
            ]
          };
        }
        if (isMounted) setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <BarChart3 className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  const monthChange = analytics?.thisMonth && analytics?.lastMonth 
    ? Math.round(((analytics.thisMonth - analytics.lastMonth) / analytics.lastMonth) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Welcome Header - Enhanced with Department Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-medium">Department Admin Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Here's your department's performance overview for {format(new Date(), 'MMMM yyyy')}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs">📊</div>
              <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs">🎯</div>
            </div>
            <span className="text-xs text-blue-100">Monitor and optimize performance</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Complaints" 
          value={analytics?.total || 0} 
          icon={FileText}
          color="from-blue-500 to-blue-600"
          trend="All time"
          change={8}
        />
        <StatCard 
          title="In Progress" 
          value={(analytics?.inProgress || 0) + (analytics?.assigned || 0)} 
          icon={Activity}
          color="from-yellow-500 to-yellow-600"
          subtitle="Active cases"
        />
        <StatCard 
          title="Resolved" 
          value={analytics?.resolved || 0} 
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          subtitle="Successfully closed"
          change={12}
        />
        <StatCard 
          title="Pending" 
          value={analytics?.pending || 0} 
          icon={AlertCircle}
          color="from-orange-500 to-orange-600"
          subtitle="Awaiting action"
          change={-5}
        />
      </div>

      {/* Resolution Rate & Monthly Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resolution Rate Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Resolution Rate</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ProgressRing percentage={analytics?.resolutionRate || 0} />
              
              <div className="mt-6 w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Target: 85%</span>
                  <span>Current: {analytics?.resolutionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, ((analytics?.resolutionRate || 0) / 85) * 100)}%`,
                      background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {analytics?.resolutionRate >= 70 
                    ? '🎉 Excellent performance! Keep it up!' 
                    : '📈 Focus on resolving pending complaints to improve rate'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Monthly Summary</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>{analytics?.thisMonth || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Month</p>
                  <p className="text-xl font-semibold text-gray-700">{analytics?.lastMonth || 0}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                  monthChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {monthChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(monthChange)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics?.resolved || 0}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{analytics?.pending || 0}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Distribution Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Status Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <StatusBar 
              label="Pending" 
              count={analytics?.pending || 0} 
              total={analytics?.total || 1} 
              color="bg-gray-500"
            />
            <StatusBar 
              label="Assigned" 
              count={analytics?.assigned || 0} 
              total={analytics?.total || 1} 
              color="bg-blue-500"
            />
            <StatusBar 
              label="In Progress" 
              count={analytics?.inProgress || 0} 
              total={analytics?.total || 1} 
              color="bg-yellow-500"
            />
            <StatusBar 
              label="Resolved" 
              count={analytics?.resolved || 0} 
              total={analytics?.total || 1} 
              color="bg-green-500"
            />
          </CardContent>
        </Card>

        {/* Category Distribution Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaints by Category</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {analytics?.categoryDistribution?.map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500'];
                return (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{category.name}</span>
                      <span className="font-medium text-gray-900">{category.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                        style={{ width: `${(category.count / (analytics?.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Officer Performance Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Officer Performance</h2>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Top performers highlighted</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-3">
            {analytics?.officerPerformance?.map((officer, index) => (
              <OfficerCard key={officer.id} officer={officer} />
            ))}
          </div>
          
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total Officers: {analytics?.officerPerformance?.length || 0}</span>
            <span>Average Rate: {Math.round(analytics?.officerPerformance?.reduce((acc, o) => acc + o.resolutionRate, 0) / (analytics?.officerPerformance?.length || 1))}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">Quick Insight</p>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {analytics?.pending > 10 
              ? `${analytics.pending} complaints need immediate attention` 
              : 'All complaints are being processed efficiently'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-700 font-medium">Target for this month</p>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Resolve {Math.ceil((analytics?.total || 0) * 0.7)} complaints to reach 70% target
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-purple-700 font-medium">Top Performer</p>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {analytics?.officerPerformance?.sort((a, b) => b.resolutionRate - a.resolutionRate)[0]?.name || 'N/A'} leads with highest resolution rate
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;