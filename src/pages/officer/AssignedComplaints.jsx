import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import {
  getAssignedComplaints,
  OFFICER_STATUSES,
  PRIORITIES,
} from '../../services/officerService';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AssignedComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      setIsLoading(true);
      try {
        setComplaints(await getAssignedComplaints(filters));
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, [filters]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Complaints</h1>
        <p className="text-gray-600 mt-1">Review complaints assigned to you.</p>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              className="pl-9"
              placeholder="Search complaints"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Statuses</option>
            {Object.entries(OFFICER_STATUSES).map(([id, status]) => (
              <option key={id} value={id}>
                {status.name}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Priorities</option>
            {Object.keys(PRIORITIES).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">No assigned complaints found.</CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardContent className="p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${OFFICER_STATUSES[complaint.status]?.color}`}>
                      {OFFICER_STATUSES[complaint.status]?.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${PRIORITIES[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-900">{complaint.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {complaint.citizen_name} - {format(new Date(complaint.created_at), 'PPP')}
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate(`/officer/complaint/${complaint.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignedComplaints;
