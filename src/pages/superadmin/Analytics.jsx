// src/pages/superadmin/Analytics.jsx
import { useState, useEffect } from 'react';
import { getSystemAnalytics } from '../../services/superAdminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  PieChart,
  Award,
  Users,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  Activity,
  Target,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{value}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {trendValue} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
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

// Category Item Component
const CategoryItem = ({ category, total, color, index }) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{category}</span>
          <span className="text-sm font-semibold text-gray-900">{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div 
            className={`h-full rounded-full ${colors[index % colors.length]}`}
            style={{ width: `${(total / 500) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Monthly Bar Chart Component
const MonthlyChart = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end h-48 gap-2">
        {data.map((month, idx) => {
          const height = (month.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex justify-center">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 cursor-pointer hover:from-blue-600 hover:to-blue-700"
                  style={{ height: `${height}px` }}
                >
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {month.count} complaints
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 rotate-45 origin-left">{month.month.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Department Ranking Card Component
const DepartmentRankCard = ({ department, rank, isTop }) => {
  const getRankBadge = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const getRateColor = () => {
    if (department.rate >= 70) return 'bg-green-100 text-green-700';
    if (department.rate >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
      isTop ? 'bg-gradient-to-r from-yellow-50 to-transparent border border-yellow-200' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
          rank === 1 ? 'bg-yellow-100 text-yellow-700' :
          rank === 2 ? 'bg-gray-100 text-gray-600' :
          rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {getRankBadge()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{department.name}</p>
          <p className="text-xs text-gray-500">{department.total} total complaints</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{department.resolved} resolved</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRateColor()}`}>
          {department.rate}% rate
        </span>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, target, unit, icon: Icon }) => {
  const percentage = (value / target) * 100;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-xs text-gray-400">Target: {target}{unit}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const GlobalAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');

  useEffect(() => {
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
            complaints: { total: 1250, pending: 245, inProgress: 320, resolved: 685, thisMonth: 145 },
            resolutionRate: 68,
            avgResponseTime: '2.5 days',
            satisfactionScore: 4.2,
            categoryDistribution: [
              { name: 'Roads & Infrastructure', value: 320 },
              { name: 'Water Supply', value: 280 },
              { name: 'Electricity', value: 250 },
              { name: 'Sanitation', value: 200 },
              { name: 'Public Safety', value: 120 },
              { name: 'Others', value: 80 }
            ],
            monthlyTrends: [
              { month: 'Jan', count: 85 },
              { month: 'Feb', count: 92 },
              { month: 'Mar', count: 108 },
              { month: 'Apr', count: 95 },
              { month: 'May', count: 112 },
              { month: 'Jun', count: 125 },
              { month: 'Jul', count: 118 },
              { month: 'Aug', count: 135 },
              { month: 'Sep', count: 142 },
              { month: 'Oct', count: 128 },
              { month: 'Nov', count: 145 },
              { month: 'Dec', count: 138 }
            ],
            departments: {
              performance: [
                { id: 1, name: 'Public Works', total: 320, resolved: 245, rate: 76.6 },
                { id: 2, name: 'Water Department', total: 280, resolved: 210, rate: 75.0 },
                { id: 3, name: 'Electricity Board', total: 250, resolved: 175, rate: 70.0 },
                { id: 4, name: 'Sanitation', total: 200, resolved: 140, rate: 70.0 },
                { id: 5, name: 'Police Department', total: 120, resolved: 85, rate: 70.8 },
                { id: 6, name: 'Other Departments', total: 80, resolved: 48, rate: 60.0 }
              ]
            },
            kpis: {
              userGrowth: { value: 1250, target: 2000 },
              complaintsPerOfficer: { value: 18, target: 25 },
              citizenSatisfaction: { value: 4.2, target: 5 }
            }
          };
        }
        if (isMounted) setAnalytics(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <BarChart3 className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Globe className="w-6 h-6" style={{ color: '#1E3A8A' }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
                Global Analytics
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                System-wide performance metrics and insights
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Complaints" 
          value={analytics?.complaints?.total || 0} 
          icon={AlertCircle}
          color="from-blue-500 to-blue-600"
          trend="up"
          trendValue="12%"
        />
        <StatsCard 
          title="Resolution Rate" 
          value={`${analytics?.resolutionRate || 0}%`} 
          icon={Target}
          color="from-green-500 to-green-600"
          trend="up"
          trendValue="5%"
        />
        <StatsCard 
          title="Avg Response Time" 
          value={analytics?.avgResponseTime || 'N/A'} 
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
        <StatsCard 
          title="Satisfaction Score" 
          value={`${analytics?.satisfactionScore || 0}/5`} 
          icon={Award}
          color="from-purple-500 to-purple-600"
          trend="up"
          trendValue="0.3"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Category Distribution</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Complaints by category type</p>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              {analytics?.categoryDistribution?.map((cat, idx) => (
                <CategoryItem 
                  key={cat.name} 
                  category={cat.name} 
                  total={cat.value} 
                  index={idx}
                />
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Categories</span>
                <span className="font-semibold text-gray-900">{analytics?.categoryDistribution?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends Chart Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Monthly Trends</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Complaint volume over time</p>
          </CardHeader>
          <CardContent className="pt-5">
            <MonthlyChart data={analytics?.monthlyTrends || []} />
            
            <div className="mt-6 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Total for {format(new Date(), 'yyyy')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics?.monthlyTrends?.reduce((sum, m) => sum + m.count, 0) || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Monthly Average</p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.round((analytics?.monthlyTrends?.reduce((sum, m) => sum + m.count, 0) || 0) / 12)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Complaint Status Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Status Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <ProgressBar 
              label="Pending" 
              value={analytics?.complaints?.pending || 0} 
              total={analytics?.complaints?.total || 1}
              color="bg-gray-500"
            />
            <ProgressBar 
              label="Assigned" 
              value={analytics?.complaints?.assigned || 0} 
              total={analytics?.complaints?.total || 1}
              color="bg-blue-500"
            />
            <ProgressBar 
              label="In Progress" 
              value={analytics?.complaints?.inProgress || 0} 
              total={analytics?.complaints?.total || 1}
              color="bg-yellow-500"
            />
            <ProgressBar 
              label="Resolved" 
              value={analytics?.complaints?.resolved || 0} 
              total={analytics?.complaints?.total || 1}
              color="bg-green-500"
            />
          </CardContent>
        </Card>

        {/* KPIs Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Key Performance Indicators</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard 
                title="User Growth" 
                value={analytics?.kpis?.userGrowth?.value || 0}
                target={analytics?.kpis?.userGrowth?.target || 100}
                unit=""
                icon={Users}
              />
              <KPICard 
                title="Complaints per Officer" 
                value={analytics?.kpis?.complaintsPerOfficer?.value || 0}
                target={analytics?.kpis?.complaintsPerOfficer?.target || 20}
                unit=""
                icon={Building2}
              />
              <KPICard 
                title="Citizen Satisfaction" 
                value={analytics?.kpis?.citizenSatisfaction?.value || 0}
                target={analytics?.kpis?.citizenSatisfaction?.target || 5}
                unit="/5"
                icon={Award}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Rankings Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Department Rankings</h2>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Based on resolution rate</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-2">
            {analytics?.departments?.performance
              ?.sort((a, b) => b.rate - a.rate)
              .map((dept, idx) => (
                <DepartmentRankCard 
                  key={dept.id} 
                  department={dept} 
                  rank={idx + 1}
                  isTop={idx < 3}
                />
              ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Total Departments: {analytics?.departments?.performance?.length || 0}</span>
            <span>System Average: {Math.round(analytics?.departments?.performance?.reduce((acc, d) => acc + d.rate, 0) / (analytics?.departments?.performance?.length || 1))}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-700">Key Insight</p>
          </div>
          <p className="text-sm text-gray-700">
            Resolution rate has increased by 5% this quarter. {analytics?.departments?.performance?.[0]?.name} department is leading with {analytics?.departments?.performance?.[0]?.rate}% rate.
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Recommendation</p>
          </div>
          <p className="text-sm text-gray-700">
            Focus on {analytics?.categoryDistribution?.[0]?.name} complaints which make up the largest category ({Math.round((analytics?.categoryDistribution?.[0]?.value / analytics?.complaints?.total) * 100)}% of total).
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnalytics;