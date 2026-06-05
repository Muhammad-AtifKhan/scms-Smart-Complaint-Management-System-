// src/pages/superadmin/Users.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUserRole, updateUserStatus, deleteUser, getAllDepartments } from '../../services/superAdminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  Shield,
  Building2,
  X,
  Send,
  Search,
  Filter,
  Crown,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// Role Badge Component
const RoleBadge = ({ role }) => {
  const config = {
    citizen: { label: 'Citizen', bg: 'bg-blue-100', text: 'text-blue-700', icon: User },
    officer: { label: 'Officer', bg: 'bg-green-100', text: 'text-green-700', icon: Briefcase },
    admin: { label: 'Dept Admin', bg: 'bg-purple-100', text: 'text-purple-700', icon: Building2 },
    super_admin: { label: 'Super Admin', bg: 'bg-red-100', text: 'text-red-700', icon: Crown }
  };
  
  const { label, bg, text, icon: Icon } = config[role] || config.citizen;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status, onClick }) => {
  const isActive = status === 'active';
  
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-red-100 text-red-700 hover:bg-red-200'
      }`}
    >
      {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
};

// User Row Component
const UserRow = ({ user, departments, onUpdateRole, onToggleStatus, onDelete }) => {
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedDept, setSelectedDept] = useState(user.department_id || '');
  
  const department = departments.find(d => d.id === user.department_id);
  
  const handleRoleUpdate = () => {
    onUpdateRole(user.id, selectedRole, selectedRole === 'officer' ? selectedDept : null);
    setShowRoleSelect(false);
  };
  
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="font-semibold text-blue-700">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          {!showRoleSelect ? (
            <button 
              onClick={() => setShowRoleSelect(true)}
              className="hover:opacity-80 transition-opacity"
            >
              <RoleBadge role={user.role} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Department Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {selectedRole === 'officer' && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(parseInt(e.target.value))}
                  className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Dept</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleRoleUpdate}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowRoleSelect(false)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {department?.name || '-'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge 
          status={user.status} 
          onClick={() => onToggleStatus(user.id, user.status)}
        />
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(new Date(user.created_at), 'MMM dd, yyyy')}
        </div>
      </td>
      <td className="px-4 py-3">
        <button 
          onClick={() => onDelete(user.id)} 
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Delete User"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onSubmit, departments, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'citizen',
    department_id: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', role: 'citizen', department_id: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-scale-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
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
                placeholder="user@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, department_id: '' })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Department Admin</option>
              </select>
            </div>
          </div>
          
          {(formData.role === 'officer' || formData.role === 'admin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department {formData.role === 'officer' ? '(Required)' : '(Required)'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        let usersData, deptsData;
        try {
          usersData = await getAllUsers();
          deptsData = await getAllDepartments();
        } catch (error) {
          console.log('Using demo data');
          usersData = [
            { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'citizen', status: 'active', created_at: new Date().toISOString() },
            { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'citizen', status: 'active', created_at: new Date().toISOString() },
            { id: 3, name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'officer', status: 'active', department_id: 1, created_at: new Date().toISOString() },
            { id: 4, name: 'Amit Verma', email: 'amit@example.com', role: 'admin', status: 'active', department_id: 2, created_at: new Date().toISOString() },
            { id: 5, name: 'Admin User', email: 'admin@system.com', role: 'super_admin', status: 'active', created_at: new Date().toISOString() }
          ];
          deptsData = [
            { id: 1, name: 'Public Works' },
            { id: 2, name: 'Water Supply' },
            { id: 3, name: 'Electricity' }
          ];
        }
        if (isMounted) {
          setUsers(usersData);
          setFilteredUsers(usersData);
          setDepartments(deptsData);
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

  useEffect(() => {
    let filtered = [...users];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const getStats = () => {
    const total = users.length;
    const citizens = users.filter(u => u.role === 'citizen').length;
    const officers = users.filter(u => u.role === 'officer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const superAdmins = users.filter(u => u.role === 'super_admin').length;
    const active = users.filter(u => u.status === 'active').length;
    
    return { total, citizens, officers, admins, superAdmins, active };
  };

  const stats = getStats();

  const handleAddUser = async (data) => {
    setIsSubmitting(true);
    try {
      const newUser = await createUser(data);
      setUsers([...users, newUser]);
      toast.success(`User "${data.name}" created successfully!`);
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId, role, departmentId) => {
    try {
      const updated = await updateUserRole(userId, role, departmentId);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const updated = await updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    if (window.confirm(`Are you sure you want to delete "${user?.name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        toast.success(`User "${user?.name}" deleted`);
      } catch (error) {
        toast.error(error.message || 'Failed to delete user');
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
          <p className="mt-4 text-gray-500">Loading users...</p>
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
            Manage Users
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage all system users, roles, and permissions
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#3B82F6' }}
          className="shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Total Users" value={stats.total} icon={Users} color="from-blue-500 to-blue-600" />
        <StatsCard title="Citizens" value={stats.citizens} icon={User} color="from-green-500 to-green-600" />
        <StatsCard title="Officers" value={stats.officers} icon={Briefcase} color="from-purple-500 to-purple-600" />
        <StatsCard title="Dept Admins" value={stats.admins} icon={Building2} color="from-orange-500 to-orange-600" />
        <StatsCard title="Super Admins" value={stats.superAdmins} icon={Crown} color="from-red-500 to-red-600" />
        <StatsCard title="Active" value={stats.active} icon={UserCheck} color="from-teal-500 to-teal-600" />
      </div>

      {/* Search and Filters */}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="officer">Officers</option>
            <option value="admin">Department Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{users.length}</span> users
        </p>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">No users found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Click "Add User" to get started'}
              </p>
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      departments={departments}
                      onUpdateRole={handleUpdateRole}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        departments={departments}
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

export default ManageUsers;