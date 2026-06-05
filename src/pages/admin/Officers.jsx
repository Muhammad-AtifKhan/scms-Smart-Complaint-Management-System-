// src/pages/admin/Officers.jsx
import { useState, useEffect } from 'react';
import { getOfficers, addOfficer, updateOfficer, deleteOfficer } from '../../services/adminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Briefcase,
  Star,
  Award,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  X,
  Send,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Enhanced Officer Card Component
const OfficerCard = ({ officer, onEdit, onDelete }) => {
  const stats = {
    assigned: officer.complaints_assigned || 0,
    resolved: officer.complaints_resolved || 0,
    pending: (officer.complaints_assigned || 0) - (officer.complaints_resolved || 0)
  };
  
  const resolutionRate = stats.assigned > 0 
    ? Math.round((stats.resolved / stats.assigned) * 100) 
    : 0;
  
  const isTopPerformer = resolutionRate >= 75 && stats.assigned >= 5;
  const isActive = officer.status === 'active';

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with status bar */}
      <div className={`h-1 ${isActive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}></div>
      
      <CardContent className="p-5">
        {/* Avatar and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isActive 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            } shadow-md`}>
              <span className="text-xl font-bold text-white">
                {officer.name?.charAt(0) || 'O'}
              </span>
            </div>
            {isTopPerformer && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit(officer)} 
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit Officer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(officer.id)} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Officer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Officer Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg">{officer.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="w-3.5 h-3.5" />
            <span>{officer.email}</span>
          </div>
          {officer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{officer.phone}</span>
            </div>
          )}
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{stats.assigned}</p>
            <p className="text-xs text-gray-500">Assigned</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        
        {/* Performance Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Performance Rate</span>
            <span className="font-medium text-gray-700">{resolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${resolutionRate}%`,
                background: resolutionRate >= 70 
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : resolutionRate >= 40 
                    ? 'linear-gradient(90deg, #3B82F6, #2563EB)'
                    : 'linear-gradient(90deg, #F59E0B, #D97706)'
              }}
            />
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-2">
          {isTopPerformer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              <Award className="w-3 h-3" />
              Top Performer
            </span>
          )}
          {stats.pending > 10 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
              <Clock className="w-3 h-3" />
              High Workload
            </span>
          )}
          {resolutionRate >= 80 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
              <CheckCircle className="w-3 h-3" />
              Excellent
            </span>
          )}
        </div>
      </CardContent>
    </div>
  );
};

// Modal Component for Add/Edit
const OfficerModal = ({ isOpen, onClose, onSubmit, officer, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active'
  });

  useEffect(() => {
    if (officer) {
      setFormData({
        name: officer.name || '',
        email: officer.email || '',
        phone: officer.phone || '',
        department: officer.department || '',
        status: officer.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        status: 'active'
      });
    }
  }, [officer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-scale-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {officer ? 'Edit Officer' : 'Add New Officer'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select department</option>
                <option value="roads">Roads & Infrastructure</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="public_safety">Public Safety</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-gray-400"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              {officer ? 'Update Officer' : 'Add Officer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Summary Component
const StatsSummary = ({ officers }) => {
  const total = officers.length;
  const active = officers.filter(o => o.status === 'active').length;
  const inactive = total - active;
  const totalAssigned = officers.reduce((sum, o) => sum + (o.complaints_assigned || 0), 0);
  const totalResolved = officers.reduce((sum, o) => sum + (o.complaints_resolved || 0), 0);
  
  const avgResolutionRate = totalAssigned > 0 
    ? Math.round((totalResolved / totalAssigned) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Officers</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Assigned</p>
            <p className="text-2xl font-bold text-blue-600">{totalAssigned}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Avg. Performance</p>
            <p className="text-2xl font-bold text-purple-600">{avgResolutionRate}%</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadOfficers = async () => {
      try { 
        let data;
        try {
          data = await getOfficers();
        } catch (error) {
          // Demo data
          data = [
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', status: 'active', complaints_assigned: 25, complaints_resolved: 18, department: 'roads' },
            { id: 2, name: 'Priya Singh', email: 'priya@example.com', phone: '+91 98765 43211', status: 'active', complaints_assigned: 20, complaints_resolved: 16, department: 'water' },
            { id: 3, name: 'Amit Verma', email: 'amit@example.com', phone: '+91 98765 43212', status: 'active', complaints_assigned: 30, complaints_resolved: 22, department: 'electricity' },
            { id: 4, name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 98765 43213', status: 'inactive', complaints_assigned: 18, complaints_resolved: 12, department: 'sanitation' },
            { id: 5, name: 'Sanjay Mehta', email: 'sanjay@example.com', phone: '+91 98765 43214', status: 'active', complaints_assigned: 22, complaints_resolved: 14, department: 'roads' }
          ];
        }
        if (isMounted) {
          setOfficers(data);
          setFilteredOfficers(data);
        }
      } catch (error) { 
        console.error(error); 
      } finally { 
        if (isMounted) setIsLoading(false); 
      }
    };
    loadOfficers();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let filtered = [...officers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.name.toLowerCase().includes(term) || 
        o.email.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    setFilteredOfficers(filtered);
  }, [searchTerm, statusFilter, officers]);

  const handleAdd = async (formData) => {
    setIsSubmitting(true);
    try {
      const newOfficer = await addOfficer(formData);
      setOfficers([...officers, newOfficer]);
      toast.success('Officer added successfully!');
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add officer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const updated = await updateOfficer(editingOfficer.id, formData);
      setOfficers(officers.map(o => o.id === updated.id ? updated : o));
      toast.success('Officer updated successfully!');
      setEditingOfficer(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update officer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this officer? This action cannot be undone.')) {
      try {
        await deleteOfficer(id);
        setOfficers(officers.filter(o => o.id !== id));
        toast.success('Officer deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete officer');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Users className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Manage Officers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Add, edit, or remove field officers in your department
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#3B82F6' }}
          className="shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {/* Stats Summary */}
      <StatsSummary officers={officers} />

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Officers</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredOfficers.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{officers.length}</span> officers
        </p>
      </div>

      {/* Officers Grid */}
      {filteredOfficers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">No officers found</h3>
          <p className="text-gray-500 text-sm">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Click "Add Officer" to get started'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfficers.map((officer) => (
            <OfficerCard 
              key={officer.id} 
              officer={officer} 
              onEdit={(o) => {
                setEditingOfficer(o);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <OfficerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isLoading={isSubmitting}
      />

      {/* Edit Modal */}
      <OfficerModal
        isOpen={!!editingOfficer}
        onClose={() => setEditingOfficer(null)}
        onSubmit={handleUpdate}
        officer={editingOfficer}
        isLoading={isSubmitting}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageOfficers;