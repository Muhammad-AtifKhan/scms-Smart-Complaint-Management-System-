import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOfficerStats, getAssignedComplaints } from '../../services/officerService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecentComplaintCard = ({ complaint, onClick }) => {
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  };

  return (
    <div 
      onClick={() => onClick(complaint.id)}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[complaint.priority]}`}>
              {complaint.priority.toUpperCase()}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{complaint.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{complaint.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
            </span>
            <span>From: {complaint.citizen_name}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[complaint.status]}`}>
            {statusLabels[complaint.status]}
          </span>
        </div>
      </div>
    </div>
  );
};

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardData = async () => {
      try {
        const statsData = await getOfficerStats();
        const complaintsData = await getAssignedComplaints();
        if (isMounted) {
          setStats(statsData);
          setRecentComplaints(complaintsData.slice(0, 5));
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">Welcome, Officer {user?.name}!</h1>
          <p className="text-green-100 mt-1">Manage and resolve assigned complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Assigned" 
          value={stats?.totalAssigned || 0} 
          icon={ClipboardList}
          color="bg-blue-500"
        />
        <StatCard 
          title="In Progress" 
          value={stats?.inProgress || 0} 
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Resolved" 
          value={stats?.resolved || 0} 
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard 
          title="Pending" 
          value={stats?.pending || 0} 
          icon={AlertCircle}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Assigned Complaints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Assigned Complaints</h2>
            <p className="text-sm text-gray-600">Complaints assigned to you</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/officer/complaints')}
          >
            <Eye className="w-4 h-4 mr-1" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No assigned complaints</p>
              </div>
            ) : (
              recentComplaints.map(complaint => (
                <RecentComplaintCard 
                  key={complaint.id} 
                  complaint={complaint} 
                  onClick={(id) => navigate(`/officer/complaint/${id}`)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">This Month Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stats?.thisMonth || 0}</p>
              <p className="text-gray-600 mt-1">Complaints assigned</p>
              <p className="text-sm text-green-600 mt-2">
                {stats?.resolvedThisMonth || 0} resolved
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stats?.avgResolutionTime || 0}h</p>
              <p className="text-gray-600 mt-1">Average resolution time</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${Math.min(100, ((stats?.resolved || 0) / (stats?.totalAssigned || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(((stats?.resolved || 0) / (stats?.totalAssigned || 1)) * 100)}% Resolution Rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficerDashboard;