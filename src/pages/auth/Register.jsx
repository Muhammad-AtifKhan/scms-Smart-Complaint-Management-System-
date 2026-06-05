// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Shield, 
  Sparkles,
  UserPlus,
  MailCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(name, email, password);
      
      // Since our endpoint returns 'message' and 'requires_verification'
      if (result.requires_verification) {
        setIsRegistered(true);
        toast.success('Account created successfully! Check your email.');
      } else {
        toast.success('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 text-center p-6">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MailCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
                <p className="text-sm text-gray-600">
                  We have sent a verification link to <span className="font-semibold">{email}</span>.
                </p>
                <p className="text-sm text-gray-500">
                  Please click the link in the email to activate your account. After verification, you can sign in to submit complaints.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/login" className="w-full">
                  <Button className="w-full" style={{ backgroundColor: '#3B82F6' }}>
                    Go to Login Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-md">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-md mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1E3A8A' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Register as Citizen
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Create an account to submit and track your complaints
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-6 h-6" style={{ color: '#1E3A8A' }} />
              <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                Create Account
              </h2>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      focusedField === 'name' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      focusedField === 'email' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      focusedField === 'password' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                    }`}
                    placeholder="Create password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      focusedField === 'confirmPassword' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                    }`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
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
              
              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full mt-2"
                style={{ backgroundColor: '#3B82F6' }}
                size="lg"
              >
                {!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}
                Sign Up
              </Button>

              <div className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-500 hover:underline">
                  Sign In
                </Link>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
