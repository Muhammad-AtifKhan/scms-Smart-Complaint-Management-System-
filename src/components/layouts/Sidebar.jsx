// src/components/layouts/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Users,
  Building2,
  Settings,
  Shield,
  ClipboardList,
  CheckCircle,
  Award,
  Briefcase,
  Crown
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    const role = user?.role;

    const commonItems = [
      { path: `/${role}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
      { path: `/${role}/profile`, icon: User, label: 'Profile' },
    ];

    const roleSpecific = {
      citizen: [
        { path: '/citizen/submit', icon: PlusCircle, label: 'Submit Complaint' },
        { path: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
        { path: '/citizen/notifications', icon: Bell, label: 'Notifications' },
      ],
      officer: [
        { path: '/officer/complaints', icon: ClipboardList, label: 'Assigned Complaints' },
      ],
      admin: [
        { path: '/admin/complaints', icon: FileText, label: 'All Complaints' },
        { path: '/admin/assign', icon: Users, label: 'Assign Complaints' },
        { path: '/admin/officers', icon: Shield, label: 'Manage Officers' },
        { path: '/admin/analytics', icon: CheckCircle, label: 'Analytics' },
      ],
      super_admin: [
        { path: '/superadmin/departments', icon: Building2, label: 'Departments' },
        { path: '/superadmin/users', icon: Users, label: 'Users' },
        { path: '/superadmin/analytics', icon: Award, label: 'Analytics' },
        { path: '/superadmin/settings', icon: Settings, label: 'Settings' },
      ],
    };

    return [...commonItems, ...(roleSpecific[role] || [])];
  };

  const navItems = getNavItems();
  const role = user?.role;

  // Role-based color schemes
  const getRoleColor = () => {
    switch (role) {
      case 'citizen': return 'blue';
      case 'officer': return 'green';
      case 'admin': return 'purple';
      case 'super_admin': return 'red';
      default: return 'primary';
    }
  };

  const roleColor = getRoleColor();
  const isSuperAdmin = role === 'super_admin';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg z-30">
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-${roleColor}-500 to-${roleColor}-600 flex items-center justify-center shadow-md`}>
            {isSuperAdmin ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Shield className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg" style={{ color: '#1E3A8A' }}>City CMS</h1>
            <p className="text-xs text-gray-400">Complaint System</p>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${roleColor}-100 to-${roleColor}-200 flex items-center justify-center shadow-sm`}>
            <span className={`font-bold text-lg text-${roleColor}-600`}>
              {user?.name?.charAt(0) || user?.avatar || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-${roleColor}-500 animate-pulse`}></div>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-${roleColor}-50 text-${roleColor}-700 shadow-sm`
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? `text-${roleColor}-600` : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isActive ? `text-${roleColor}-700` : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${roleColor}-500`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;