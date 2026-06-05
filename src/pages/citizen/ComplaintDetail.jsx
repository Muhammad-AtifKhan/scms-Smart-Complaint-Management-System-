// src/pages/citizen/ComplaintDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Hash,
  Tag,
  Flag,
  Download,
  Share2,
  ExternalLink,
  Star,
  ThumbsUp,
  MessageSquare,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

// Enhanced Status Badge with modern design
const StatusBadge = ({ status }) => {
  const config = {
    pending: { 
      label: 'Pending', 
      bgColor: 'bg-gray-100', 
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: Clock,
      dotColor: 'bg-gray-500'
    },
    assigned: { 
      label: 'Assigned', 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: User,
      dotColor: 'bg-blue-500'
    },
    in_progress: { 
      label: 'In Progress', 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      icon: Activity,
      dotColor: 'bg-yellow-500'
    },
    resolved: { 
      label: 'Resolved', 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      dotColor: 'bg-green-500'
    },
    rejected: { 
      label: 'Rejected', 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      dotColor: 'bg-red-500'
    }
  };
  
  const { label, bgColor, textColor, borderColor, icon: Icon, dotColor } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Enhanced Priority Badge
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { label: 'High Priority', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    medium: { label: 'Medium Priority', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    low: { label: 'Low Priority', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  };
  
  const { label, color, bgColor, borderColor } = config[priority] || config.medium;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bgColor} ${color} border ${borderColor}`}>
      <Flag className="w-3 h-3" />
      {label}
    </span>
  );
};

// Enhanced Timeline Item
const TimelineItem = ({ item, isLast }) => {
  const getIconConfig = (action) => {
    if (action.includes('Submitted')) return { emoji: '📝', bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
    if (action.includes('Assigned')) return { emoji: '👤', bgColor: 'bg-purple-100', textColor: 'text-purple-600' };
    if (action.includes('Started')) return { emoji: '🔧', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' };
    if (action.includes('Resolved')) return { emoji: '✅', bgColor: 'bg-green-100', textColor: 'text-green-600' };
    if (action.includes('Rejected')) return { emoji: '❌', bgColor: 'bg-red-100', textColor: 'text-red-600' };
    return { emoji: '📍', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
  };

  const iconConfig = getIconConfig(item.action);

  return (
    <div className="relative pb-8 group">
      {!isLast && (
        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-300 to-transparent" />
      )}
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className={`h-10 w-10 rounded-full ${iconConfig.bgColor} flex items-center justify-center text-xl transform transition-transform group-hover:scale-110 duration-200`}>
            {iconConfig.emoji}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow duration-200">
            <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>{item.action}</p>
            <p className="text-xs text-gray-500 mt-1">
              By <span className="font-medium text-gray-700">{item.actor}</span> • {format(new Date(item.date), 'PPP')} at {format(new Date(item.date), 'p')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <Icon className="w-4 h-4" style={{ color: '#3B82F6' }} />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{value}</p>
    </div>
  </div>
);

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setIsLoading(true);
    try {
      const data = await getComplaintById(id);
      setComplaint(data);
    } catch (error) {
      console.error('Error loading complaint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download complaint details');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: '#1F2937' }}>Complaint Not Found</h2>
        <p className="text-gray-600 mt-1">The complaint you're looking for doesn't exist</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/citizen/complaints')}
          style={{ backgroundColor: '#3B82F6' }}
        >
          Back to Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/citizen/complaints')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download Details"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Details</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Tag} label="Category" value={complaint.category} />
                <InfoRow icon={Flag} label="Priority" value={complaint.priority.toUpperCase()} />
                <InfoRow icon={Calendar} label="Submitted On" value={format(new Date(complaint.created_at), 'PPP')} />
                <InfoRow icon={Clock} label="Last Updated" value={format(new Date(complaint.updated_at || complaint.created_at), 'PPP')} />
              </div>
            </CardContent>
          </Card>

          {/* Images Gallery */}
          {complaint.images && complaint.images.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Evidence Images</h2>
                  <span className="ml-auto text-xs text-gray-500">{complaint.images.length} images</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <div 
                      key={index}
                      className="relative group cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-36 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}/{complaint.images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Officer Remarks */}
          {complaint.remarks && complaint.remarks.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Officer Remarks</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {complaint.remarks.map((remark, idx) => (
                  <div key={remark.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium" style={{ color: '#1F2937' }}>{remark.officer_name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(remark.date), 'PPP')}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm">{remark.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Status Information Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Status Information</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Current Status</span>
                <StatusBadge status={complaint.status} />
              </div>
              {complaint.officer_name && (
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Assigned Officer</span>
                  <span className="text-sm font-semibold" style={{ color: '#1E3A8A' }}>{complaint.officer_name}</span>
                </div>
              )}
              {complaint.resolved_at && (
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Resolved On</span>
                  <span className="text-sm text-gray-800">
                    {format(new Date(complaint.resolved_at), 'PPP')}
                  </span>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {complaint.status === 'resolved' ? '100%' : 
                     complaint.status === 'in_progress' ? '60%' :
                     complaint.status === 'assigned' ? '30%' : '10%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: complaint.status === 'resolved' ? '100%' : 
                             complaint.status === 'in_progress' ? '60%' :
                             complaint.status === 'assigned' ? '30%' : '10%',
                      backgroundColor: '#3B82F6'
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Timeline</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flow-root max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <ul className="-mb-8">
                  {complaint.timeline && complaint.timeline.map((item, index) => (
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

          {/* Quick Actions Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Need Help?</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View Guidelines
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain animate-scale-up"
          />
        </div>
      )}

      {/* Add custom styles for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3B82F6;
          border-radius: 10px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ComplaintDetail;