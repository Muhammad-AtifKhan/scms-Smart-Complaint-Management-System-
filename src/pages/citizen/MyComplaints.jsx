import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyComplaints } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Search, Filter, Eye, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

const ComplaintRow = ({ complaint, onClick }) => {
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
      className="hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 last:border-0"
    >
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[complaint.priority]}`}>
              {complaint.priority.toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[complaint.status]}`}>
              {statusLabels[complaint.status]}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{complaint.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{complaint.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
            </span>
            {complaint.officer_name && (
              <span>Assigned to: {complaint.officer_name}</span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </div>
    </div>
  );
};

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, complaints]);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.id.toLowerCase().includes(searchLower) || 
        c.title.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredComplaints(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
        <p className="text-gray-600 mt-1">Track and manage all your submitted complaints</p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or title..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {PRIORITY_FILTERS.map(priority => (
                <option key={priority.value} value={priority.value}>
                  Priority: {priority.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Complaints</h2>
            <p className="text-sm text-gray-600">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </p>
          </div>
          <Button onClick={() => navigate('/citizen/submit')}>
            New Complaint
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No complaints found</p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => navigate('/citizen/submit')}
              >
                Submit Your First Complaint
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredComplaints.map(complaint => (
                <ComplaintRow 
                  key={complaint.id} 
                  complaint={complaint} 
                  onClick={(id) => navigate(`/citizen/complaint/${id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyComplaints;