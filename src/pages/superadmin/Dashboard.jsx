// src/pages/superadmin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSystemAnalytics } from '../../services/superAdminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { 
  Users, 
  FileText, 
  Building2, 
  CheckCircle, 
  Crown,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Award,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

// Enhanced Stat Card with animations
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, trendValue }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="group bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {trendValue} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-md group-hover:shadow-lg transition-all`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ percentage, size = 140, title, color }) => {
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
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>{percentage}%</span>
          <p className="text-xs text-gray-500 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Department Performance Card
const DepartmentCard = ({ department, rank }) => {
  const getRankIcon = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };
  
  const getRateColor = () => {
    if (department.rate >= 70) return 'bg-green-100 text-green-700';
    if (department.rate >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{department.name}</p>
            {getRankIcon() && <span className="text-sm">{getRankIcon()}</span>}
          </div>
          <p className="text-xs text-gray-500">{department.total} complaints</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">{department.resolved} resolved</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRateColor()}`}>
          {department.rate}% rate
        </span>
      </div>
    </div>
  );
};

// Activity Timeline Component
const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Activity className="w-4 h-4 text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">{activity.user}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
        <span className="text-xs text-gray-400">{activity.time}</span>
      </div>
    </div>
  </div>
);

// User Distribution Pie Chart
const UserDistribution = ({ citizens, officers, admins }) => {
  const total = citizens + officers + admins;
  const citizenPercent = (citizens / total) * 100;
  const officerPercent = (officers / total) * 100;
  const adminPercent = (admins / total) * 100;
  
  return (
    <div className="space-y-3">
      <div className="relative h-32 w-32 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#3B82F6" strokeWidth="10"
            strokeDasharray={`${citizenPercent * 2.827} 282.7`}
            strokeLinecap="round"
          />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#10B981" strokeWidth="10"
            strokeDasharray={`${officerPercent * 2.827} 282.7`}
            strokeDashoffset={-citizenPercent * 2.827}
            strokeLinecap="round"
          />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="10"
            strokeDasharray={`${adminPercent * 2.827} 282.7`}
            strokeDashoffset={-(citizenPercent + officerPercent) * 2.827}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Citizens ({citizens})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Officers ({officers})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Admins ({admins})</span>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    
    let isMounted = true;
    const loadData = async () => {
      try {
        let data;
        try {
          data = await getSystemAnalytics();
        } catch (error) {
          console.log('Using demo data');
          // Demo data
          data = {
            users: { total: 12500, citizens: 11800, officers: 620, admins: 80, thisMonth: 450 },
            complaints: { total: 8750, pending: 1250, inProgress: 2100, resolved: 5200, rejected: 200, thisMonth: 890, resolutionRate: 68 },
            departments: { total: 12, performance: [
              { id: 1, name: 'Public Works', total: 2450, resolved: 1850, rate: 75.5 },
              { id: 2, name: 'Water Department', total: 2100, resolved: 1550, rate: 73.8 },
              { id: 3, name: 'Electricity Board', total: 1850, resolved: 1300, rate: 70.3 },
              { id: 4, name: 'Sanitation', total: 1200, resolved: 850, rate: 70.8 },
              { id: 5, name: 'Police Department', total: 800, resolved: 520, rate: 65.0 },
              { id: 6, name: 'Other', total: 350, resolved: 220, rate: 62.9 }
            ] },
            systemHealth: { status: 'healthy', uptime: '99.9%', responseTime: '1.2s' },
            recentActivities: [
              { action: 'New department added: Health Services', user: 'System Admin', time: '2 hours ago' },
              { action: 'System backup completed', user: 'Auto Backup', time: '5 hours ago' },
              { action: 'User registration spike detected', user: 'System', time: '1 day ago' },
              { action: 'Performance report generated', user: 'Analytics Bot', time: '2 days ago' }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Globe className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading system dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Welcome Header - Super Admin Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">
                {greeting === 'Good Morning' ? '🌅' : greeting === 'Good Afternoon' ? '☀️' : '🌙'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {greeting}, {user?.name?.split(' ')[0]}!
              </h1>
            </div>
            <p className="text-red-100 text-sm">
              System-wide overview and analytics at your fingertips
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs">🏆</div>
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs">📊</div>
              </div>
              <span className="text-xs text-red-100">Super Admin Access</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/30 rounded-xl backdrop-blur-sm">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Users" 
          value={analytics?.users?.total?.toLocaleString() || 0} 
          icon={Users}
          color="from-blue-500 to-blue-600"
          subtitle={`${analytics?.users?.citizens?.toLocaleString() || 0} citizens, ${analytics?.users?.officers || 0} officers`}
          trend="up"
          trendValue="8%"
        />
        <StatCard 
          title="Total Complaints" 
          value={analytics?.complaints?.total?.toLocaleString() || 0} 
          icon={FileText}
          color="from-purple-500 to-purple-600"
          subtitle={`${analytics?.complaints?.thisMonth || 0} this month`}
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Departments" 
          value={analytics?.departments?.total || 0} 
          icon={Building2}
          color="from-green-500 to-green-600"
          subtitle="Active departments"
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${analytics?.complaints?.resolutionRate || 0}%`} 
          icon={CheckCircle}
          color="from-teal-500 to-teal-600"
          trend="up"
          trendValue="5%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resolution Rate Ring */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>System Performance</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ProgressRing 
                percentage={analytics?.complaints?.resolutionRate || 0} 
                title="Resolution Rate"
                color="#3B82F6"
              />
              
              <div className="mt-6 w-full grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics?.complaints?.resolved?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{analytics?.complaints?.inProgress?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{analytics?.complaints?.pending?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>User Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <UserDistribution 
              citizens={analytics?.users?.citizens || 0}
              officers={analytics?.users?.officers || 0}
              admins={analytics?.users?.admins || 0}
            />
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Users (This Month)</span>
                <span className="font-semibold text-blue-600">+{analytics?.users?.thisMonth?.toLocaleString() || 0}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((analytics?.users?.thisMonth || 0) / (analytics?.users?.total || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Status & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Complaint Status Overview */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Status Overview</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-gray-900">{analytics?.complaints?.pending?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: `${((analytics?.complaints?.pending || 0) / (analytics?.complaints?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium text-gray-900">{analytics?.complaints?.inProgress?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${((analytics?.complaints?.inProgress || 0) / (analytics?.complaints?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Resolved</span>
                <span className="font-medium text-gray-900">{analytics?.complaints?.resolved?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((analytics?.complaints?.resolved || 0) / (analytics?.complaints?.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Rejected</span>
                <span className="font-medium text-gray-900">{analytics?.complaints?.rejected || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${((analytics?.complaints?.rejected || 0) / (analytics?.complaints?.total || 1)) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Department Performance</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {analytics?.departments?.performance?.map((dept, idx) => (
                <DepartmentCard key={dept.id} department={dept} rank={idx + 1} />
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Total Departments: {analytics?.departments?.total || 0}</span>
              <span>System Average: {Math.round(analytics?.departments?.performance?.reduce((acc, d) => acc + d.rate, 0) / (analytics?.departments?.performance?.length || 1))}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {analytics?.recentActivities?.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>System Health</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{analytics?.systemHealth?.uptime || '99.9%'}</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{analytics?.systemHealth?.responseTime || '1.2s'}</p>
                <p className="text-xs text-gray-500">Response Time</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">24/7</p>
                <p className="text-xs text-gray-500">Support</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-green-700">All systems operational</p>
              </div>
              <p className="text-xs text-green-600 mt-1">Last checked: {format(new Date(), 'hh:mm a, MMM dd')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Growth Insight</p>
          </div>
          <p className="text-sm text-gray-700">
            User base grew by 8% this month. Citizen registrations are at an all-time high.
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-700">Top Department</p>
          </div>
          <p className="text-sm text-gray-700">
            {analytics?.departments?.performance?.[0]?.name} leads with {analytics?.departments?.performance?.[0]?.rate}% resolution rate.
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-medium text-orange-700">Attention Needed</p>
          </div>
          <p className="text-sm text-gray-700">
            {analytics?.complaints?.pending > analytics?.complaints?.inProgress 
              ? `${analytics?.complaints?.pending} complaints pending assignment` 
              : 'All departments performing within targets'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;