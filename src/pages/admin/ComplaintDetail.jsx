// src/pages/admin/ComplaintDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, getOfficers, assignComplaint } from '../../services/adminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  ArrowLeft, 
  UserPlus, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Tag,
  Flag,
  Building2,
  UserCheck,
  X,
  Send,
  History,
  Eye,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Enhanced Status Badge
const StatusBadge = ({ status }) => {
  const config = { 
    pending: { label: 'Pending', color: 'bg-gray-100', textColor: 'text-gray-700', icon: Clock, dotColor: 'bg-gray-500' },
    assigned: { label: 'Assigned', color: 'bg-blue-100', textColor: 'text-blue-700', icon: UserCheck, dotColor: 'bg-blue-500' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Clock, dotColor: 'bg-yellow-500' },
    resolved: { label: 'Resolved', color: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle, dotColor: 'bg-green-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100', textColor: 'text-red-700', icon: AlertCircle, dotColor: 'bg-red-500' }
  };
  const { label, color, textColor, icon: Icon, dotColor } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${color} ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Enhanced Priority Badge
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

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, color = 'blue' }) => (
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

// Timeline Item Component
const TimelineItem = ({ item, isLast }) => (
  <div className="relative pb-8 group">
    {!isLast && (
      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-300 to-transparent" />
    )}
    <div className="relative flex items-start space-x-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-200">
          <History className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-semibold text-gray-900">{item.action}</p>
          <p className="text-xs text-gray-500 mt-1">
            By <span className="font-medium text-gray-700">{item.actor}</span> • {format(new Date(item.date), 'PPP')} at {format(new Date(item.date), 'p')}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Officer Selection Modal Component
const OfficerSelectionModal = ({ isOpen, onClose, officers, selectedOfficerId, setSelectedOfficerId, onAssign, isAssigning }) => {
  if (!isOpen) return null;
  
  const activeOfficers = officers.filter(o => o.status === 'active');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-scale-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Officer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-5">
          {activeOfficers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No active officers available</p>
              <Button variant="outline" className="mt-3" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeOfficers.map((officer) => (
                  <label
                    key={officer.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedOfficerId === officer.id.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {officer.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{officer.name}</p>
                        <p className="text-xs text-gray-500">{officer.email}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="officer"
                      value={officer.id}
                      checked={selectedOfficerId === officer.id.toString()}
                      onChange={(e) => setSelectedOfficerId(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={onAssign} 
                  isLoading={isAssigning}
                  disabled={!selectedOfficerId}
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Assign Complaint
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const complaintData = await getComplaintById(id);
        const officersData = await getOfficers();
        if (isMounted) {
          setComplaint(complaintData);
          setOfficers(officersData);
        }
      } catch (error) {
        toast.error(error.message);
        navigate('/admin/complaints');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [id, navigate]);

  const handleAssign = async () => {
    if (!selectedOfficerId) {
      toast.error('Please select an officer');
      return;
    }
    setIsAssigning(true);
    try {
      const updated = await assignComplaint(id, parseInt(selectedOfficerId));
      setComplaint(updated);
      const selectedOfficer = officers.find(o => o.id === parseInt(selectedOfficerId));
      toast.success(`Complaint assigned to ${selectedOfficer?.name} successfully!`);
      setShowAssignModal(false);
      setSelectedOfficerId('');
    } catch (error) {
      toast.error(error.message);
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
            <FileText className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading complaint details...</p>
        </div>
      </div>
    );
  }
  
  if (!complaint) return null;

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/complaints')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
                {complaint.title}
              </h1>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                ID: {complaint.id}
              </span>
            </div>
          </div>
        </div>
        
        {complaint.status === 'pending' && (
          <Button 
            onClick={() => setShowAssignModal(true)}
            style={{ backgroundColor: '#3B82F6' }}
            className="shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign to Officer
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Complaint Details Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Details</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-gray-50 to-transparent p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-800 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={Tag} label="Category" value={complaint.category} color="purple" />
                  <InfoRow icon={Flag} label="Priority" value={<PriorityBadge priority={complaint.priority} />} color="orange" />
                  <InfoRow icon={Calendar} label="Submitted On" value={format(new Date(complaint.created_at), 'PPP')} color="blue" />
                  <InfoRow icon={Clock} label="Last Updated" value={format(new Date(complaint.updated_at || complaint.created_at), 'PPP')} color="gray" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citizen Information Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Citizen Information</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">
                    {complaint.citizen_name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{complaint.citizen_name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {complaint.citizen_email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {complaint.citizen_email}
                      </span>
                    )}
                    {complaint.citizen_phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {complaint.citizen_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          {complaint.timeline && complaint.timeline.length > 0 && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Timeline</h2>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flow-root max-h-96 overflow-y-auto pr-2">
                  <ul className="-mb-8">
                    {complaint.timeline.map((item, index) => (
                      <TimelineItem 
                        key={index}
                        item={item}
                        isLast={index === complaint.timeline.length - 1}
                      />
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Assignment Information Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Assignment Info</h2>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {complaint.officer_name ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned Officer</p>
                      <p className="font-semibold text-gray-900">{complaint.officer_name}</p>
                    </div>
                  </div>
                  {complaint.assigned_at && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Assigned On</span>
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(complaint.assigned_at), 'PPP')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Not assigned yet</p>
                  {complaint.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowAssignModal(true)}
                    >
                      Assign Now
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Quick Actions</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Print Details
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Copy Link
                </button>
                {complaint.officer_name && (
                  <button 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message Officer
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Officer Selection Modal */}
      <OfficerSelectionModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedOfficerId('');
        }}
        officers={officers}
        selectedOfficerId={selectedOfficerId}
        setSelectedOfficerId={setSelectedOfficerId}
        onAssign={handleAssign}
        isAssigning={isAssigning}
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

export default AdminComplaintDetail;