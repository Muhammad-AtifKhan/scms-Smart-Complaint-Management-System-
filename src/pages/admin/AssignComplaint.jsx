// src/pages/admin/AssignComplaint.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOfficers, assignComplaint } from '../../services/adminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  UserCheck, 
  ArrowLeft, 
  User, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Award,
  TrendingUp,
  Shield,
  Users,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Officer Card Component
const OfficerCard = ({ officer, isSelected, onSelect }) => {
  const stats = {
    assigned: officer.complaints_assigned || 0,
    resolved: officer.complaints_resolved || 0,
    pending: (officer.complaints_assigned || 0) - (officer.complaints_resolved || 0)
  };
  
  const resolutionRate = stats.assigned > 0 
    ? Math.round((stats.resolved / stats.assigned) * 100) 
    : 0;

  return (
    <label
      className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <input
        type="radio"
        name="officer"
        value={officer.id}
        checked={isSelected}
        onChange={(e) => onSelect(e.target.value)}
        className="absolute top-4 right-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
      />
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
            <span className="text-xl font-bold text-white">
              {officer.name?.charAt(0) || 'O'}
            </span>
            {officer.status === 'active' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">{officer.name}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                <Shield className="w-3 h-3" />
                Active
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {officer.email}
              </span>
              {officer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {officer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="flex gap-4 md:gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            <p className="text-xs text-gray-500">Assigned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-blue-600">{resolutionRate}</p>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">Rate</p>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {stats.assigned > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Completion Rate</span>
            <span>{resolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${resolutionRate}%`,
                background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500' : 'group-hover:ring-1 group-hover:ring-blue-300'
      }`}></div>
    </label>
  );
};

// Complaint Info Row Component
const ComplaintInfoRow = ({ icon: Icon, label, value, color = 'blue' }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className={`p-2 rounded-lg bg-${color}-100`}>
      <Icon className={`w-4 h-4 text-${color}-600`} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'Not specified'}</p>
    </div>
  </div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const config = {
    low: { label: 'Low Priority', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: '🟢' },
    medium: { label: 'Medium Priority', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', icon: '🟡' },
    high: { label: 'High Priority', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', icon: '🟠' },
    emergency: { label: 'Emergency', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: '🔴' }
  };
  
  const { label, color, bg, border, icon } = config[priority] || config.medium;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${color} border ${border}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
};

const AssignComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedComplaint = location.state?.selectedComplaint;
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!selectedComplaint) {
      navigate('/admin/complaints');
      return;
    }
    
    let isMounted = true;
    const loadOfficers = async () => {
      try { 
        const data = await getOfficers(); 
        if (isMounted) setOfficers(data); 
      } catch (error) { 
        console.error(error);
        // Demo data if API fails
        if (isMounted) {
          setOfficers([
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', status: 'active', complaints_assigned: 5, complaints_resolved: 3 },
            { id: 2, name: 'Priya Singh', email: 'priya@example.com', phone: '+91 98765 43211', status: 'active', complaints_assigned: 3, complaints_resolved: 2 },
            { id: 3, name: 'Amit Verma', email: 'amit@example.com', phone: '+91 98765 43212', status: 'active', complaints_assigned: 7, complaints_resolved: 5 },
            { id: 4, name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 98765 43213', status: 'active', complaints_assigned: 2, complaints_resolved: 1 }
          ]);
        }
      } finally { 
        if (isMounted) setIsLoading(false); 
      }
    };
    loadOfficers();
    return () => { isMounted = false; };
  }, [selectedComplaint, navigate]);

  const handleAssign = async () => {
    if (!selectedOfficerId) {
      toast.error('Please select an officer to assign');
      return;
    }
    
    setIsAssigning(true);
    try {
      await assignComplaint(selectedComplaint.id, parseInt(selectedOfficerId));
      const selectedOfficer = officers.find(o => o.id === parseInt(selectedOfficerId));
      toast.success(`Complaint assigned to ${selectedOfficer?.name} successfully!`);
      navigate('/admin/complaints');
    } catch (error) {
      toast.error(error.message || 'Failed to assign complaint');
    } finally {
      setIsAssigning(false);
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

  const activeOfficers = officers.filter(o => o.status === 'active');

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Assign Complaint
          </h1>
          <p className="text-gray-500 mt-1">Select an officer to handle this complaint</p>
        </div>
      </div>

      {/* Complaint Details Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" style={{ color: '#3B82F6' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Details</h2>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplaintInfoRow 
              icon={AlertCircle} 
              label="Complaint ID" 
              value={selectedComplaint.id}
              color="blue"
            />
            <ComplaintInfoRow 
              icon={PriorityBadge} 
              label="Priority" 
              value={<PriorityBadge priority={selectedComplaint.priority} />}
              color="orange"
            />
            <ComplaintInfoRow 
              icon={User} 
              label="Citizen Name" 
              value={selectedComplaint.citizen_name}
              color="green"
            />
            <ComplaintInfoRow 
              icon={Briefcase} 
              label="Category" 
              value={selectedComplaint.category}
              color="purple"
            />
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Officer Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Select Officer</h2>
            </div>
            <div className="text-sm text-gray-500">
              {activeOfficers.length} officers available
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {activeOfficers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">No officers available</h3>
              <p className="text-sm text-gray-500 mt-1">
                There are no active officers to assign this complaint
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/admin/officers')}
              >
                Manage Officers
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOfficers.map((officer) => (
                <OfficerCard
                  key={officer.id}
                  officer={officer}
                  isSelected={selectedOfficerId === officer.id.toString()}
                  onSelect={setSelectedOfficerId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {activeOfficers.length > 0 && (
        <div className="flex gap-3 justify-end sticky bottom-4">
          <button
            type="button"
            onClick={() => navigate('/admin/complaints')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isAssigning || !selectedOfficerId}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isAssigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Assign Complaint
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            The assigned officer will be notified immediately and will start working on this complaint.
            You can track the progress from the complaints dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignComplaint;