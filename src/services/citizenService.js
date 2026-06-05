// src/services/citizenService.js
import { getCurrentUser } from './authService';
import request from './api';

// ==================== CONSTANTS ====================
export const CATEGORIES = [
  { id: 1, name: 'Roads & Infrastructure', color: 'bg-orange-500' },
  { id: 2, name: 'Water Supply', color: 'bg-blue-500' },
  { id: 3, name: 'Electricity', color: 'bg-yellow-500' },
  { id: 4, name: 'Sanitation', color: 'bg-green-500' },
  { id: 5, name: 'Public Safety', color: 'bg-red-500' },
  { id: 6, name: 'Healthcare', color: 'bg-purple-500' },
  { id: 7, name: 'Education', color: 'bg-indigo-500' },
  { id: 8, name: 'Transport', color: 'bg-teal-500' },
];

export const PRIORITIES = [
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800' },
  { id: 'emergency', name: 'Emergency', color: 'bg-red-100 text-red-800' },
];

export const STATUSES = {
  pending: { name: 'Pending', color: 'bg-gray-100 text-gray-800' },
  assigned: { name: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  in_progress: { name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { name: 'Resolved', color: 'bg-green-100 text-green-800' },
  rejected: { name: 'Rejected', color: 'bg-red-100 text-red-800' },
};

// ==================== MOCK DATA ====================
let mockComplaints = [
  {
    id: 'CMP-001',
    title: 'Broken street light near Sector 12 park',
    description: 'The street light has been broken for 2 weeks, making the area unsafe at night.',
    category: 'Electricity',
    priority: 'high',
    status: 'in_progress',
    citizen_id: 1,
    officer_name: 'Amit Kumar',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-18T14:20:00Z',
    resolved_at: null,
    images: [],
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
    id: 'CMP-002',
    title: 'Water leakage on Main Street',
    description: 'Water has been leaking near the main intersection for the last 3 days.',
    category: 'Water Supply',
    priority: 'emergency',
    status: 'assigned',
    citizen_id: 1,
    officer_name: 'Neha Singh',
    created_at: '2025-01-17T08:15:00Z',
    updated_at: '2025-01-18T10:00:00Z',
    resolved_at: null,
    images: [],
    remarks: [],
    timeline: [
      { action: 'Complaint Submitted', date: '2025-01-17T08:15:00Z', actor: 'Rahul Sharma' },
      { action: 'Assigned to Officer', date: '2025-01-17T09:00:00Z', actor: 'Dr. Mehta' },
    ],
  },
  {
    id: 'CMP-003',
    title: 'Garbage not collected for a week',
    description: 'Municipal garbage has not been collected from our colony for the past week.',
    category: 'Sanitation',
    priority: 'high',
    status: 'pending',
    citizen_id: 1,
    officer_name: null,
    created_at: '2025-01-19T09:00:00Z',
    updated_at: '2025-01-19T09:00:00Z',
    resolved_at: null,
    images: [],
    remarks: [],
    timeline: [
      { action: 'Complaint Submitted', date: '2025-01-19T09:00:00Z', actor: 'Rahul Sharma' },
    ],
  },
];

let mockNotifications = [
  {
    id: 1,
    title: 'Complaint Status Updated',
    message: 'Your complaint CMP-001 has been marked as In Progress',
    complaint_id: 'CMP-001',
    is_read: false,
    created_at: '2025-01-18T14:20:00Z',
    type: 'status_update',
  },
  {
    id: 2,
    title: 'Complaint Assigned',
    message: 'Your complaint CMP-002 has been assigned to Officer Neha Singh',
    complaint_id: 'CMP-002',
    is_read: false,
    created_at: '2025-01-17T09:00:00Z',
    type: 'assignment',
  },
];

// ==================== UTILITIES ====================
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const requireCurrentUser = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return currentUser;
};

// ==================== COMPLAINT APIs ====================
export const getMyComplaints = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status_filter', filters.status);
  if (filters.priority) params.append('priority_filter', filters.priority);
  if (filters.search) params.append('search', filters.search);
  
  return request(`/complaints?${params.toString()}`);
};

export const getAllComplaints = async (filters = {}) => {
  return getMyComplaints(filters);
};

export const getComplaintById = async (id) => {
  return request(`/complaints/${id}`);
};

export const createComplaint = async (data) => {
  return request('/complaints', {
    method: 'POST',
    body: data
  });
};

export const uploadImages = async (complaintId, imageFiles) => {
  const formData = new FormData();
  formData.append('complaint_id', complaintId);
  formData.append('file_purpose', 'evidence');
  imageFiles.forEach((file) => {
    formData.append('files', file);
  });
  
  return request('/files/upload', {
    method: 'POST',
    body: formData
  });
};

// ==================== STATS APIs ====================
export const getComplaintStats = async () => {
  return request('/complaints/stats');
};

export const getCitizenStats = async () => {
  return request('/complaints/stats');
};

// ==================== NOTIFICATION APIs ====================
export const getNotifications = async () => {
  return request('/notifications');
};

export const markNotificationRead = async (notificationId) => {
  return request(`/notifications/${notificationId}/read`, {
    method: 'PUT'
  });
};

export const markAllNotificationsRead = async () => {
  return request('/notifications/read-all', {
    method: 'PUT'
  });
};

// ==================== PROFILE APIs ====================
export const updateProfile = async (data) => {
  const updatedUser = await request('/auth/profile', {
    method: 'PUT',
    body: data
  });
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};

export const changePassword = async (oldPassword, newPassword) => {
  return request('/auth/change-password', {
    method: 'POST',
    body: {
      old_password: oldPassword,
      new_password: newPassword
    }
  });
};