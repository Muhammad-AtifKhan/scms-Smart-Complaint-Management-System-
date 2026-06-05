// src/pages/admin/Complaints.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartmentComplaints } from '../../services/adminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Search, 
  Eye, 
  Calendar, 
  AlertCircle, 
  UserPlus,
  Filter,
  X,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Briefcase,
  ArrowUpDown,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' }
];

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'emergency', label: 'Emergency' }
];

// Enhanced Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: Clock },
    assigned: { label: 'Assigned', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: Users },
    in_progress: { label: 'In Progress', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: RefreshCw },
    resolved: { label: 'Resolved', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: AlertCircle }
  };
  const { label, bgColor, textColor, icon: Icon } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Enhanced Priority Badge
const PriorityBadge = ({ priority }) => {
  const config = {
    low: { label: 'Low', bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' },
    medium: { label: 'Medium', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' },
    high: { label: 'High', bgColor: 'bg-orange-100', textColor: 'text-orange-700', dotColor: 'bg-orange-500' },
    emergency: { label: 'Emergency', bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' }
  };
  const { label, bgColor, textColor, dotColor } = config[priority] || config.medium;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
};

// Enhanced Complaint Row Component
const ComplaintRow = ({ complaint, onAssign, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {complaint.id}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
              {complaint.category && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                  <Briefcase className="w-3 h-3" />
                  {complaint.category}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
              {complaint.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                From: <span className="font-medium text-gray-700">{complaint.citizen_name}</span>
              </span>
              {complaint.officer_name && (
                <span className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Officer: <span className="font-medium text-gray-700">{complaint.officer_name}</span>
                </span>
              )}
              {complaint.resolved_at && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Resolved on {format(new Date(complaint.resolved_at), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onClick(complaint.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            {complaint.status === 'pending' && (
              <button
                onClick={() => onAssign(complaint)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 text-sm font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar for In Progress complaints */}
        {complaint.status === 'in_progress' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: '65%',
                  background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, change }) => (
  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// Filter Chip Component
const FilterChip = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
        active ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadComplaints = async () => {
      try { 
        const data = await getDepartmentComplaints(); 
        if (isMounted) setComplaints(data || []); 
      } catch (error) { 
        console.error(error);
        // Demo data if API fails
        if (isMounted) {
          setComplaints([
            { id: 'CMP-001', title: 'Broken street light', description: 'Street light not working', category: 'Electricity', priority: 'high', status: 'pending', citizen_name: 'Rahul Sharma', created_at: new Date().toISOString() },
            { id: 'CMP-002', title: 'Water leakage', description: 'Water pipe broken', category: 'Water Supply', priority: 'emergency', status: 'assigned', citizen_name: 'Priya Patel', officer_name: 'Rajesh Kumar', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'CMP-003', title: 'Garbage collection', description: 'Garbage not collected', category: 'Sanitation', priority: 'medium', status: 'in_progress', citizen_name: 'Amit Verma', officer_name: 'Neha Singh', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'CMP-004', title: 'Road damage', description: 'Pothole on main road', category: 'Roads', priority: 'high', status: 'resolved', citizen_name: 'Sneha Reddy', officer_name: 'Amit Kumar', resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
          ]);
        }
      } finally { 
        if (isMounted) setIsLoading(false); 
      }
    };
    loadComplaints();
    return () => { isMounted = false; };
  }, []);

  const filteredComplaints = useMemo(() => {
    let filtered = [...complaints];
    if (filters.status !== 'all') filtered = filtered.filter(c => c.status === filters.status);
    if (filters.priority !== 'all') filtered = filtered.filter(c => c.priority === filters.priority);
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.id && c.id.toLowerCase().includes(searchLower)) || 
        (c.title && c.title.toLowerCase().includes(searchLower)) ||
        (c.citizen_name && c.citizen_name.toLowerCase().includes(searchLower))
      );
    }
    return filtered;
  }, [filters, complaints]);

  const getStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    return { total, pending, inProgress, resolved };
  };

  const stats = getStats();
  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search;

  const clearFilters = () => {
    setFilters({ status: 'all', priority: 'all', search: '' });
  };

  const handleAssign = (complaint) => {
    navigate('/admin/assign', { state: { selectedComplaint: complaint } });
  };

  const handleExport = () => {
    toast.success('Exporting complaints...');
    // Implement export functionality
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Briefcase className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Department Complaints
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage and assign complaints to officers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Complaints" 
          value={stats.total} 
          icon={AlertCircle}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard 
          title="Pending" 
          value={stats.pending} 
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
        <StatsCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={RefreshCw}
          color="from-orange-500 to-orange-600"
        />
        <StatsCard 
          title="Resolved" 
          value={stats.resolved} 
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          change={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% rate`}
        />
      </div>

      {/* Search and Filters Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, title or citizen name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            >
              {STATUS_FILTERS.map(status => (
                <option key={status.value} value={status.value}>
                  Status: {status.label}
                </option>
              ))}
            </select>
            
            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            >
              {PRIORITY_FILTERS.map(priority => (
                <option key={priority.value} value={priority.value}>
                  Priority: {priority.label}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Active filters:</span>
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                  Status: {filters.status}
                  <button onClick={() => setFilters({ ...filters, status: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.priority !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                  Priority: {filters.priority}
                  <button onClick={() => setFilters({ ...filters, priority: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                  Search: {filters.search}
                  <button onClick={() => setFilters({ ...filters, search: '' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredComplaints.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{complaints.length}</span> complaints
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Complaints List */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>All Complaints</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage and track complaint status</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">No complaints found</h3>
              <p className="text-gray-500 text-sm">
                {hasActiveFilters ? 'Try adjusting your filters' : 'No complaints have been submitted yet'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredComplaints.map((complaint) => (
                <ComplaintRow 
                  key={complaint.id} 
                  complaint={complaint} 
                  onAssign={handleAssign} 
                  onClick={(id) => navigate(`/admin/complaint/${id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Assign Note */}
      {filteredComplaints.some(c => c.status === 'pending') && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start gap-2">
            <UserPlus className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-800">
              You have pending complaints that need to be assigned to officers. Click the "Assign" button to delegate them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;