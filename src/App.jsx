// src/App.jsx - With Error Handling
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// ==================== LAYOUTS ====================
import AuthLayout from './components/layouts/AuthLayout';
import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// ==================== AUTH PAGES ====================
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg">
            <h1 className="text-red-600 text-xl font-bold mb-2">Something went wrong!</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load components to identify which one is failing
const CitizenDashboard = React.lazy(() => import('./pages/citizen/Dashboard'));
const SubmitComplaint = React.lazy(() => import('./pages/citizen/SubmitComplaint'));
const MyComplaints = React.lazy(() => import('./pages/citizen/MyComplaints'));
const CitizenComplaintDetail = React.lazy(() => import('./pages/citizen/ComplaintDetail'));
const Notifications = React.lazy(() => import('./pages/citizen/Notifications'));
const CitizenProfile = React.lazy(() => import('./pages/citizen/Profile'));

const OfficerDashboard = React.lazy(() => import('./pages/officer/Dashboard'));
const AssignedComplaints = React.lazy(() => import('./pages/officer/AssignedComplaints'));
const OfficerComplaintDetail = React.lazy(() => import('./pages/officer/ComplaintDetail'));
const OfficerProfile = React.lazy(() => import('./pages/officer/Profile'));

const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminComplaints = React.lazy(() => import('./pages/admin/Complaints'));
const AssignComplaint = React.lazy(() => import('./pages/admin/AssignComplaint'));
const ManageOfficers = React.lazy(() => import('./pages/admin/Officers'));
const AdminComplaintDetail = React.lazy(() => import('./pages/admin/ComplaintDetail'));
const AdminProfile = React.lazy(() => import('./pages/admin/Profile'));

const SuperAdminDashboard = React.lazy(() => import('./pages/superadmin/Dashboard'));
const ManageDepartments = React.lazy(() => import('./pages/superadmin/Departments'));
const ManageUsers = React.lazy(() => import('./pages/superadmin/Users'));
const GlobalAnalytics = React.lazy(() => import('./pages/superadmin/Analytics'));
const SystemSettings = React.lazy(() => import('./pages/superadmin/Settings'));
const SuperAdminProfile = React.lazy(() => import('./pages/superadmin/Profile'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Citizen Routes */}
              <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
                  <Route path="/citizen/submit" element={<SubmitComplaint />} />
                  <Route path="/citizen/complaints" element={<MyComplaints />} />
                  <Route path="/citizen/complaint/:id" element={<CitizenComplaintDetail />} />
                  <Route path="/citizen/notifications" element={<Notifications />} />
                  <Route path="/citizen/profile" element={<CitizenProfile />} />
                </Route>
              </Route>

              {/* Officer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                  <Route path="/officer/complaints" element={<AssignedComplaints />} />
                  <Route path="/officer/complaint/:id" element={<OfficerComplaintDetail />} />
                  <Route path="/officer/profile" element={<OfficerProfile />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/complaints" element={<AdminComplaints />} />
                  <Route path="/admin/assign" element={<AssignComplaint />} />
                  <Route path="/admin/officers" element={<ManageOfficers />} />
                  <Route path="/admin/complaint/:id" element={<AdminComplaintDetail />} />
                  <Route path="/admin/analytics" element={<AdminDashboard />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>
              </Route>

              {/* Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/superadmin/departments" element={<ManageDepartments />} />
                  <Route path="/superadmin/users" element={<ManageUsers />} />
                  <Route path="/superadmin/analytics" element={<GlobalAnalytics />} />
                  <Route path="/superadmin/settings" element={<SystemSettings />} />
                  <Route path="/superadmin/profile" element={<SuperAdminProfile />} />
                </Route>
              </Route>

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </React.Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;