// src/pages/superadmin/Profile.jsx
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, changePassword } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Save, 
  Lock, 
  Crown, 
  User, 
  Mail, 
  Shield, 
  Camera,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  Activity,
  Calendar,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color }) => (
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

// Activity Item Component
const ActivityItem = ({ action, date, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'login': return '🔐';
      case 'update': return '✏️';
      case 'security': return '🛡️';
      default: return '📌';
    }
  };
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-xl">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Icon className="w-4 h-4 text-red-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'Not specified'}</p>
    </div>
  </div>
);

const SuperAdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210',
    department: 'System Administration',
    role: 'Super Administrator'
  });
  const [passwordData, setPasswordData] = useState({ 
    oldPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });

  // Mock stats data
  const stats = {
    systemsManaged: 12,
    usersManaged: 12500,
    uptime: '99.9',
    securityScore: 98
  };

  // Mock recent activities
  const recentActivities = [
    { action: 'Logged in from new device', date: '2 hours ago', type: 'login' },
    { action: 'Updated system security settings', date: '1 day ago', type: 'security' },
    { action: 'Reviewed department analytics', date: '2 days ago', type: 'update' },
    { action: 'Generated system report', date: '3 days ago', type: 'update' },
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateProfile(profileData);
      if (updateUser) updateUser(updatedUser);
      else localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully! 🎉');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword === passwordData.oldPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setIsPasswordLoading(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success('Password changed successfully! 🔒');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SA';
  };

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Super Admin Profile
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your system administrator account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Card & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-red-600 to-red-700"></div>
            <CardContent className="p-6 text-center relative">
              <div className="relative inline-block -mt-16 mb-4">
                <div 
                  className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center cursor-pointer group overflow-hidden"
                  onClick={handleImageClick}
                >
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-red-600">
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
                <Crown className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard 
              label="Systems Managed" 
              value={stats.systemsManaged} 
              icon={Globe}
              color="from-blue-500 to-blue-600"
            />
            <StatsCard 
              label="Users Managed" 
              value={stats.usersManaged.toLocaleString()} 
              icon={User}
              color="from-green-500 to-green-600"
            />
            <StatsCard 
              label="System Uptime" 
              value={`${stats.uptime}%`} 
              icon={Activity}
              color="from-purple-500 to-purple-600"
            />
            <StatsCard 
              label="Security Score" 
              value={`${stats.securityScore}%`} 
              icon={Shield}
              color="from-red-500 to-red-600"
            />
          </div>

          {/* Additional Info */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Account Info</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <InfoField label="Department" value={profileData.department} icon={Building2} />
              <InfoField label="Role" value={profileData.role} icon={Crown} />
              <InfoField label="Member Since" value="January 2024" icon={Calendar} />
              <InfoField label="Last Login" value={format(new Date(), 'PPP')} icon={Activity} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Recent Activity</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2">
                {recentActivities.map((activity, idx) => (
                  <ActivityItem key={idx} {...activity} />
                ))}
              </div>
              <button className="w-full mt-3 text-center text-xs text-red-600 hover:text-red-700 pt-2 border-t border-gray-100">
                View Full History
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Personal Information</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Update your personal details</p>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleProfileUpdate} className="space-y-5">
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
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    isLoading={isLoading}
                    style={{ backgroundColor: '#DC2626' }}
                    className="shadow-md hover:shadow-lg hover:bg-red-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Change Password</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Update your password to keep your account secure</p>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Password Requirements */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs font-medium text-red-800 mb-2">Password requirements:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Minimum 6 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Should be different from current password
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Include at least one number and special character
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    isLoading={isPasswordLoading} 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Security Notice</h3>
                <p className="text-xs text-gray-600 mt-1">
                  As a Super Administrator, you have full system access. Please ensure your account remains secure.
                  Enable two-factor authentication for additional security.
                </p>
                <button className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
                  Enable 2FA →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import missing icons
import { Building2, Phone } from 'lucide-react';

export default SuperAdminProfile;