// src/pages/admin/Profile.jsx
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Save, 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Building2,
  Clock,
  Award,
  CheckCircle,
  Edit2,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Fingerprint,
  Globe,
  Link
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

// Stats Card Component
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// Info Field Component
const InfoField = ({ label, value, icon: Icon, editable = false, onEdit }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || 'Not specified'}</p>
      </div>
    </div>
    {editable && (
      <button 
        onClick={onEdit}
        className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// Activity Item Component
const ActivityItem = ({ action, date, status }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Activity className="w-4 h-4 text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{action}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      status === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {status === 'success' ? 'Completed' : 'Pending'}
    </span>
  </div>
);

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210',
    department: user?.department || 'Public Works Department',
    role: user?.role || 'Department Admin',
    joinDate: user?.joinDate || 'January 2024',
    address: user?.address || 'Municipal Corporation Building, City Center',
  });

  // Mock stats data
  const stats = {
    complaintsManaged: 145,
    officersManaged: 8,
    resolutionRate: 86,
    pendingActions: 12
  };

  // Mock recent activities
  const recentActivities = [
    { action: 'Assigned complaint CMP-001 to Officer Rajesh', date: '2 hours ago', status: 'success' },
    { action: 'Updated department settings', date: '1 day ago', status: 'success' },
    { action: 'Reviewed officer performance report', date: '2 days ago', status: 'success' },
    { action: 'Approved new officer registration', date: '3 days ago', status: 'pending' },
  ];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(updatedUser);
      toast.success('Profile updated successfully! 🎉');
      setIsSaving(false);
      setIsEditing(false);
    }, 500);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'A';
  };

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Admin Profile
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your department admin account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Card & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]"></div>
            <CardContent className="p-6 text-center relative">
              <div className="relative inline-block -mt-16 mb-4">
                <div 
                  className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center cursor-pointer group overflow-hidden"
                  onClick={handleImageClick}
                >
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold" style={{ color: '#1E3A8A' }}>
                      {getInitials(user?.name)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              
              <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                {user?.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-500">{profileData.role}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Verified Admin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <Building2 className="w-3 h-3" />
                  {profileData.department}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Complaints Managed" 
              value={stats.complaintsManaged} 
              icon={Activity}
              color="from-blue-500 to-blue-600"
            />
            <StatCard 
              label="Officers Managed" 
              value={stats.officersManaged} 
              icon={Users}
              color="from-green-500 to-green-600"
            />
            <StatCard 
              label="Resolution Rate" 
              value={`${stats.resolutionRate}%`} 
              icon={Award}
              color="from-purple-500 to-purple-600"
            />
            <StatCard 
              label="Pending Actions" 
              value={stats.pendingActions} 
              icon={Clock}
              color="from-orange-500 to-orange-600"
            />
          </div>

          {/* Additional Info */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Account Info</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <InfoField 
                label="Department" 
                value={profileData.department} 
                icon={Building2}
              />
              <InfoField 
                label="Member Since" 
                value={profileData.joinDate} 
                icon={Calendar}
              />
              <InfoField 
                label="Admin Level" 
                value="Department Administrator" 
                icon={Shield}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Personal Information</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Update your personal details</p>
            </CardHeader>
            <CardContent className="pt-5">
              {!isEditing ? (
                <div className="space-y-4">
                  <InfoField label="Full Name" value={profileData.name} icon={User} />
                  <InfoField label="Email Address" value={profileData.email} icon={Mail} />
                  <InfoField label="Phone Number" value={profileData.phone} icon={Phone} />
                  <InfoField label="Address" value={profileData.address} icon={MapPin} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        rows="3"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '+91 98765 43210',
                          department: user?.department || 'Public Works Department',
                          role: user?.role || 'Department Admin',
                          joinDate: user?.joinDate || 'January 2024',
                          address: user?.address || 'Municipal Corporation Building, City Center',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Recent Activity</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
              
              <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 pt-3 border-t border-gray-100">
                View All Activity
              </button>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Security Notice</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Your admin account has full access to department data. Please keep your credentials secure and never share them with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Users icon if not already imported
import { Users } from 'lucide-react';

export default AdminProfile;