// src/pages/superadmin/Departments.jsx
import { useState, useEffect } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment, getAllUsers } from '../../services/superAdminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  CheckCircle, 
  Clock,
  Calendar,
  Mail,
  Phone,
  Award,
  TrendingUp,
  X,
  Send,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Enhanced Department Card Component
const DepartmentCard = ({ department, onEdit, onDelete }) => {
  const performanceRate = department.complaint_count > 0 
    ? Math.round((department.resolved_count / department.complaint_count) * 100) 
    : 0;
  
  const getPerformanceColor = () => {
    if (performanceRate >= 70) return 'bg-green-100 text-green-700';
    if (performanceRate >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`h-1 ${performanceRate >= 70 ? 'bg-green-500' : performanceRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            {performanceRate >= 70 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                <Award className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit(department)} 
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit Department"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(department.id)} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Department"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-2">{department.name}</h3>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Total Complaints</span>
            <span className="font-semibold text-gray-900">{department.complaint_count || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Resolved</span>
            <span className="font-semibold text-green-600">{department.resolved_count || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Pending</span>
            <span className="font-semibold text-yellow-600">
              {(department.complaint_count || 0) - (department.resolved_count || 0)}
            </span>
          </div>
        </div>
        
        {/* Performance Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Performance</span>
            <span className="font-medium">{performanceRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${performanceRate}%`,
                background: performanceRate >= 70 
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : performanceRate >= 40 
                    ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                    : 'linear-gradient(90deg, #EF4444, #DC2626)'
              }}
            />
          </div>
        </div>
        
        {/* Admin Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Admin:</span>
            <span className="text-xs font-medium text-gray-700">
              {department.admin_name || 'Not assigned'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Created:</span>
            <span className="text-xs text-gray-600">
              {format(new Date(department.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

// Stats Summary Component
const StatsSummary = ({ departments }) => {
  const total = departments.length;
  const totalComplaints = departments.reduce((sum, d) => sum + (d.complaint_count || 0), 0);
  const totalResolved = departments.reduce((sum, d) => sum + (d.resolved_count || 0), 0);
  const avgPerformance = totalComplaints > 0 ? Math.round((totalResolved / totalComplaints) * 100) : 0;
  const departmentsWithAdmin = departments.filter(d => d.admin_id).length;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Departments</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Complaints</p>
            <p className="text-2xl font-bold text-purple-600">{totalComplaints}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{totalResolved}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Avg. Performance</p>
            <p className="text-2xl font-bold text-yellow-600">{avgPerformance}%</p>
          </div>
          <div className="p-2 bg-yellow-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Department Modal Component
const DepartmentModal = ({ isOpen, onClose, onSubmit, department, admins, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    admin_id: '',
    description: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        admin_id: department.admin_id || '',
        description: department.description || '',
        contact_email: department.contact_email || '',
        contact_phone: department.contact_phone || ''
      });
    } else {
      setFormData({
        name: '',
        admin_id: '',
        description: '',
        contact_email: '',
        contact_phone: ''
      });
    }
  }, [department]);

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
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {department ? 'Edit Department' : 'Add New Department'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter department name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Department Admin (Optional)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.admin_id}
                onChange={(e) => setFormData({ ...formData, admin_id: e.target.value ? parseInt(e.target.value) : '' })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select an admin (Optional)</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of department responsibilities"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="department@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 12345 67890"
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              {department ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        let depts, users;
        try {
          depts = await getAllDepartments();
          users = await getAllUsers();
        } catch (error) {
          console.log('Using demo data');
          depts = [
            { id: 1, name: 'Public Works Department', admin_id: 1, admin_name: 'Rajesh Kumar', complaint_count: 245, resolved_count: 185, created_at: new Date().toISOString(), description: 'Roads, bridges, and infrastructure' },
            { id: 2, name: 'Water Supply Department', admin_id: 2, admin_name: 'Priya Singh', complaint_count: 210, resolved_count: 155, created_at: new Date().toISOString(), description: 'Water distribution and quality' },
            { id: 3, name: 'Electricity Board', admin_id: 3, admin_name: 'Amit Verma', complaint_count: 185, resolved_count: 130, created_at: new Date().toISOString(), description: 'Power supply and maintenance' },
            { id: 4, name: 'Sanitation Department', admin_id: null, admin_name: null, complaint_count: 120, resolved_count: 85, created_at: new Date().toISOString(), description: 'Waste management and cleaning' },
            { id: 5, name: 'Public Safety', admin_id: null, admin_name: null, complaint_count: 80, resolved_count: 52, created_at: new Date().toISOString(), description: 'Police and security services' }
          ];
          users = [
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'admin' },
            { id: 2, name: 'Priya Singh', email: 'priya@example.com', role: 'admin' },
            { id: 3, name: 'Amit Verma', email: 'amit@example.com', role: 'admin' }
          ];
        }
        if (isMounted) {
          setDepartments(depts);
          setAdmins(users?.filter(u => u.role === 'admin') || []);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.admin_name && dept.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async (formData) => {
    setIsSubmitting(true);
    try {
      const newDept = await createDepartment(formData);
      setDepartments([...departments, newDept]);
      toast.success('Department created successfully!');
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const updated = await updateDepartment(editingDept.id, formData);
      setDepartments(departments.map(d => d.id === updated.id ? updated : d));
      toast.success('Department updated successfully!');
      setEditingDept(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Delete this department? This will affect all associated complaints and data. This action cannot be undone.')) {
      try {
        await deleteDepartment(id);
        setDepartments(departments.filter(d => d.id !== id));
        toast.success('Department deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete department');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Building2 className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading departments...</p>
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
            Manage Departments
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create, edit, or remove departments in the system
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#3B82F6' }}
          className="shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Stats Summary */}
      <StatsSummary departments={departments} />

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search departments by name or admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredDepartments.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{departments.length}</span> departments
        </p>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">No departments found</h3>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Try adjusting your search' : 'Click "Add Department" to get started'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <DepartmentCard 
              key={dept.id} 
              department={dept} 
              onEdit={(d) => setEditingDept(d)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <DepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        admins={admins}
        isLoading={isSubmitting}
      />

      {/* Edit Department Modal */}
      <DepartmentModal
        isOpen={!!editingDept}
        onClose={() => setEditingDept(null)}
        onSubmit={handleUpdate}
        department={editingDept}
        admins={admins}
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

export default ManageDepartments;