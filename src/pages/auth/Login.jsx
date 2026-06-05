// src/pages/auth/Login.jsx - Updated form fields
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input'; // Make sure Input component has proper label association
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { 
  User, 
  Shield, 
  Crown,
  Building2,
  Wrench,
  Sparkles,
  Fingerprint,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = [
  { 
    role: "Citizen", 
    email: "rahul@example.com", 
    icon: User, 
    bgColor: "bg-blue-500",
    role_name: "citizen",
    description: "File & track complaints"
  },
  { 
    role: "Officer", 
    email: "amit@example.com", 
    icon: Wrench, 
    bgColor: "bg-green-500",
    role_name: "officer",
    description: "Handle assigned complaints"
  },
  { 
    role: "Dept Admin", 
    email: "mehta@example.com", 
    icon: Building2, 
    bgColor: "bg-purple-500",
    role_name: "admin",
    description: "Manage department & officers"
  },
  { 
    role: "Super Admin", 
    email: "admin@system.com", 
    icon: Crown, 
    bgColor: "bg-red-500",
    role_name: "super_admin",
    description: "Full system control"
  }
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now log in. 🎉');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error') === 'invalid_token') {
      toast.error('Invalid or expired verification link.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error') === 'expired_token') {
      toast.error('Verification link has expired.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(`Welcome back! 🎉`);
        
        setTimeout(() => {
          const userRole = result.user.role;
          switch (userRole) {
            case 'citizen':
              navigate('/citizen/dashboard');
              break;
            case 'officer':
              navigate('/officer/dashboard');
              break;
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'super_admin':
              navigate('/superadmin/dashboard');
              break;
            default:
              navigate('/');
          }
        }, 500);
      } else {
        toast.error(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail) => {
    const demoPassword = 'demo123';
    setEmail(demoEmail);
    setPassword(demoPassword);

    // State update is async — pass values directly instead of relying on state
    setIsLoading(true);
    try {
      const result = await login(demoEmail, demoPassword);
      if (result.success) {
        toast.success(`Welcome back! 🎉`);
        const userRole = result.user.role;
        setTimeout(() => {
          switch (userRole) {
            case 'citizen': navigate('/citizen/dashboard'); break;
            case 'officer': navigate('/officer/dashboard'); break;
            case 'admin': navigate('/admin/dashboard'); break;
            case 'super_admin': navigate('/superadmin/dashboard'); break;
            default: navigate('/');
          }
        }, 500);
      } else {
        toast.error(result.message || 'Login failed.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-lg mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1E3A8A' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold" style={{ color: '#1E3A8A' }}>
            City Complaint System
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-3">
            Citizen Grievance Redressal Platform — Fast, Transparent, Efficient
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Login Form Section */}
          <div>
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="w-6 h-6" style={{ color: '#1E3A8A' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                    Welcome Back
                  </h2>
                </div>
                <p className="text-gray-600">
                  Sign in to your account to continue
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field - Fixed with id and label association */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                          focusedField === 'email' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                        }`}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Password Field - Fixed with id and label association */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                          focusedField === 'password' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                        }`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="rememberMe"
                        id="rememberMe"
                        className="rounded focus:ring-2 focus:ring-blue-500" 
                        style={{ accentColor: '#3B82F6' }} 
                      />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="text-sm hover:underline" style={{ color: '#3B82F6' }}>
                      Forgot password?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    isLoading={isLoading} 
                    className="w-full"
                    style={{ backgroundColor: '#3B82F6' }}
                    size="lg"
                  >
                    {!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}
                    Sign In
                  </Button>

                  <div className="text-center text-sm text-gray-600 pt-2">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => navigate('/register')}
                      className="font-semibold text-blue-500 hover:underline"
                    >
                      Register as Citizen
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    🔐 Demo credentials available below — click on any role card
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Cards Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1E3A8A' }}>
                Quick Demo Access
              </h3>
              <p className="text-gray-600 text-sm">
                Click any role to instantly test the system
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {DEMO_CREDENTIALS.map((demo) => {
                const Icon = demo.icon;
                
                return (
                  <button
                    key={demo.role}
                    onClick={() => handleDemoClick(demo.email, demo.role_name)}
                    className="text-left p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg bg-white border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${demo.bgColor}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#1F2937' }}>{demo.role}</p>
                        <p className="text-xs text-gray-500">{demo.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {demo.description}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* Feature Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <CheckCircle2 className="w-4 h-4 mb-1" style={{ color: '#3B82F6' }} />
                <p className="text-gray-700 text-xs font-medium">24/7 Complaint Filing</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <CheckCircle2 className="w-4 h-4 mb-1" style={{ color: '#3B82F6' }} />
                <p className="text-gray-700 text-xs font-medium">Real-time Tracking</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <CheckCircle2 className="w-4 h-4 mb-1" style={{ color: '#3B82F6' }} />
                <p className="text-gray-700 text-xs font-medium">Smart Assignment</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <CheckCircle2 className="w-4 h-4 mb-1" style={{ color: '#3B82F6' }} />
                <p className="text-gray-700 text-xs font-medium">Analytics Dashboard</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-xs">
            © 2024 City Complaint System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;