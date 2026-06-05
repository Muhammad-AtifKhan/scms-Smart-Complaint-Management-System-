import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Save, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  addComplaintRemark,
  getOfficerComplaintById,
  OFFICER_STATUSES,
  PRIORITIES,
  updateComplaintStatus,
} from '../../services/officerService';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        const data = await getOfficerComplaintById(id);
        setComplaint(data);
        setStatus(data.status);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaint();
  }, [id]);

  const handleStatusUpdate = async () => {
    setIsSaving(true);
    try {
      const updated = await updateComplaintStatus(id, status);
      setComplaint(updated);
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemarkSubmit = async (event) => {
    event.preventDefault();
    if (!remark.trim()) return;

    setIsSaving(true);
    try {
      const updated = await addComplaintRemark(id, remark.trim());
      setComplaint(updated);
      setRemark('');
      toast.success('Remark added');
    } catch (error) {
      toast.error(error.message || 'Failed to add remark');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!complaint) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">Complaint not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/officer/complaints')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <p className="text-sm text-gray-500">{complaint.id}</p>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Complaint Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{complaint.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Citizen</p>
                  <p className="font-medium text-gray-900">{complaint.citizen_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{complaint.citizen_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{complaint.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Priority</p>
                  <span className={`inline-flex mt-1 text-xs px-2 py-1 rounded-full ${PRIORITIES[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Remarks</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.remarks.length === 0 ? (
                <p className="text-sm text-gray-500">No remarks yet.</p>
              ) : (
                complaint.remarks.map((item) => (
                  <div key={item.id} className="border-l-4 border-primary-500 pl-4 py-1">
                    <p className="text-gray-700">{item.text}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{item.officer_name}</span>
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(item.date), 'PPP')}</span>
                    </div>
                  </div>
                ))
              )}

              <form onSubmit={handleRemarkSubmit} className="space-y-3">
                <textarea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add progress remark"
                />
                <Button type="submit" isLoading={isSaving}>
                  Add Remark
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Update Status</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(OFFICER_STATUSES).map(([id, item]) => (
                  <option key={id} value={id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleStatusUpdate} isLoading={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.timeline.map((item) => (
                <div key={`${item.action}-${item.date}`} className="border-l-2 border-primary-200 pl-4">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.date), 'PPP')} by {item.actor}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
