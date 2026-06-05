import { getCurrentUser } from './authService';
import request from './api';

export const OFFICER_STATUSES = {
  assigned: { name: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  in_progress: { name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { name: 'Resolved', color: 'bg-green-100 text-green-800' },
  rejected: { name: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export const PRIORITIES = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

let assignedComplaints = [
  {
    id: 'CMP-001',
    title: 'Broken street light near Sector 12 park',
    description: 'The street light has been broken for 2 weeks, making the area unsafe at night.',
    category: 'Electricity',
    priority: 'high',
    status: 'in_progress',
    officer_id: 3,
    citizen_name: 'Rahul Sharma',
    citizen_phone: '+92 300 1111111',
    location: 'Sector 12 Park',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-18T14:20:00Z',
    resolved_at: null,
    remarks: [
      {
        id: 1,
        text: 'Inspected the site. Replacement parts have been ordered.',
        officer_name: 'Amit Kumar',
        date: '2025-01-16T09:15:00Z',
      },
    ],
    timeline: [
      { action: 'Complaint Submitted', date: '2025-01-15T10:30:00Z', actor: 'Rahul Sharma' },
      { action: 'Assigned to Officer', date: '2025-01-15T11:00:00Z', actor: 'Dr. Mehta' },
      { action: 'Work Started', date: '2025-01-16T09:15:00Z', actor: 'Amit Kumar' },
    ],
  },
  {
    id: 'CMP-005',
    title: 'Potholes near City Mall',
    description: 'Multiple deep potholes on the road are dangerous for two-wheelers.',
    category: 'Roads & Infrastructure',
    priority: 'medium',
    status: 'assigned',
    officer_id: 3,
    citizen_name: 'Priya Patel',
    citizen_phone: '+92 300 2222222',
    location: 'City Mall Road',
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-20T09:00:00Z',
    resolved_at: null,
    remarks: [],
    timeline: [
      { action: 'Complaint Submitted', date: '2025-01-20T09:00:00Z', actor: 'Priya Patel' },
      { action: 'Assigned to Officer', date: '2025-01-20T10:00:00Z', actor: 'Dr. Mehta' },
    ],
  },
  {
    id: 'CMP-006',
    title: 'Traffic signal not working',
    description: 'Main chowk traffic signal is not working during peak hours.',
    category: 'Transport',
    priority: 'emergency',
    status: 'resolved',
    officer_id: 3,
    citizen_name: 'Hassan Ali',
    citizen_phone: '+92 300 3333333',
    location: 'Main Chowk',
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-09T17:30:00Z',
    resolved_at: '2025-01-09T17:30:00Z',
    remarks: [
      {
        id: 1,
        text: 'Signal controller was reset and tested successfully.',
        officer_name: 'Amit Kumar',
        date: '2025-01-09T17:30:00Z',
      },
    ],
    timeline: [
      { action: 'Complaint Submitted', date: '2025-01-08T12:00:00Z', actor: 'Hassan Ali' },
      { action: 'Resolved', date: '2025-01-09T17:30:00Z', actor: 'Amit Kumar' },
    ],
  },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const requireOfficer = () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'officer') {
    throw new Error('Officer authentication required');
  }
  return user;
};

export const getAssignedComplaints = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status_filter', filters.status);
  if (filters.priority) params.append('priority_filter', filters.priority);
  if (filters.search) params.append('search', filters.search);
  
  return request(`/complaints?${params.toString()}`);
};

export const getOfficerStats = async () => {
  return request('/complaints/stats');
};

export const getOfficerComplaintById = async (id) => {
  return request(`/complaints/${id}`);
};

export const updateComplaintStatus = async (id, status) => {
  return request(`/complaints/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
};

export const addComplaintRemark = async (id, text) => {
  return request(`/complaints/${id}/remarks`, {
    method: 'POST',
    body: { text }
  });
};

export const updateOfficerProfile = async (data) => {
  const updatedUser = await request('/auth/profile', {
    method: 'PUT',
    body: data
  });
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};
