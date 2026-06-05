// src/services/adminService.js
import { getCurrentUser } from './authService';
import request from './api';

// Mock departments data
const DEPARTMENTS = [
  { id: 1, name: "Roads & Infrastructure", icon: "🚧", complaint_count: 45, resolved_count: 32, admin_id: 6 },
  { id: 2, name: "Water Supply", icon: "💧", complaint_count: 38, resolved_count: 28, admin_id: 6 },
  { id: 3, name: "Electricity", icon: "⚡", complaint_count: 67, resolved_count: 51, admin_id: 6 },
  { id: 4, name: "Sanitation", icon: "🗑️", complaint_count: 52, resolved_count: 41, admin_id: 6 },
  { id: 5, name: "Public Safety", icon: "👮", complaint_count: 30, resolved_count: 22, admin_id: 7 },
  { id: 6, name: "Healthcare", icon: "🏥", complaint_count: 25, resolved_count: 18, admin_id: 7 },
];

// Mock officers data
let MOCK_OFFICERS = [
  { id: 3, name: "Amit Kumar", email: "amit@example.com", phone: "+91 98765 43210", department_id: 1, status: "active", complaints_assigned: 5, complaints_resolved: 12, join_date: "2024-01-15" },
  { id: 4, name: "Neha Singh", email: "neha@example.com", phone: "+91 98765 43211", department_id: 1, status: "active", complaints_assigned: 3, complaints_resolved: 8, join_date: "2024-02-10" },
  { id: 5, name: "Vikram Rathore", email: "vikram@example.com", phone: "+91 98765 43212", department_id: 2, status: "active", complaints_assigned: 7, complaints_resolved: 15, join_date: "2024-01-20" },
  { id: 6, name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43213", department_id: 2, status: "inactive", complaints_assigned: 2, complaints_resolved: 4, join_date: "2024-03-01" },
  { id: 7, name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91 98765 43214", department_id: 3, status: "active", complaints_assigned: 8, complaints_resolved: 18, join_date: "2024-01-10" },
];

// Mock complaints for admin (all department complaints)
let MOCK_DEPARTMENT_COMPLAINTS = [
  {
    id: "CMP-001",
    title: "Broken street light near Sector 12 park",
    description: "The street light has been broken for 2 weeks, making the area unsafe at night.",
    category: "Electricity",
    priority: "high",
    status: "in_progress",
    citizen_id: 1,
    citizen_name: "Rahul Sharma",
    citizen_email: "rahul@example.com",
    citizen_phone: "+91 98765 43210",
    officer_id: 3,
    officer_name: "Amit Kumar",
    department_id: 3,
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-18T14:20:00Z",
    assigned_at: "2025-01-15T11:00:00Z",
    resolved_at: null,
    images: [],
    remarks: [
      {
        id: 1,
        text: "Inspected the site. Replacement parts have been ordered.",
        officer_name: "Amit Kumar",
        date: "2025-01-16T09:15:00Z"
      }
    ],
    timeline: [
      { action: "Complaint Submitted", date: "2025-01-15T10:30:00Z", actor: "Rahul Sharma" },
      { action: "Assigned to Officer", date: "2025-01-15T11:00:00Z", actor: "Admin" },
      { action: "Work Started", date: "2025-01-16T09:15:00Z", actor: "Amit Kumar" }
    ]
  },
  {
    id: "CMP-002",
    title: "Water leakage on Main Street",
    description: "Major water leakage on Main Street. Water is wasting continuously.",
    category: "Water Supply",
    priority: "emergency",
    status: "assigned",
    citizen_id: 1,
    citizen_name: "Rahul Sharma",
    citizen_email: "rahul@example.com",
    citizen_phone: "+91 98765 43210",
    officer_id: null,
    officer_name: null,
    department_id: 2,
    created_at: "2025-01-17T08:15:00Z",
    updated_at: "2025-01-18T10:00:00Z",
    assigned_at: null,
    resolved_at: null,
    images: [],
    remarks: [],
    timeline: [
      { action: "Complaint Submitted", date: "2025-01-17T08:15:00Z", actor: "Rahul Sharma" },
      { action: "Assigned to Officer", date: "2025-01-18T10:00:00Z", actor: "Admin" }
    ]
  },
  {
    id: "CMP-003",
    title: "Potholes near City Mall",
    description: "Multiple deep potholes on the road near City Mall causing traffic issues.",
    category: "Roads & Infrastructure",
    priority: "high",
    status: "resolved",
    citizen_id: 2,
    citizen_name: "Priya Patel",
    citizen_email: "priya@example.com",
    citizen_phone: "+91 98765 43220",
    officer_id: 3,
    officer_name: "Amit Kumar",
    department_id: 1,
    created_at: "2025-01-10T14:30:00Z",
    updated_at: "2025-01-14T16:45:00Z",
    assigned_at: "2025-01-11T09:00:00Z",
    resolved_at: "2025-01-14T16:45:00Z",
    images: [],
    remarks: [
      {
        id: 2,
        text: "Potholes have been filled and road repaired.",
        officer_name: "Amit Kumar",
        date: "2025-01-14T16:45:00Z"
      }
    ],
    timeline: [
      { action: "Complaint Submitted", date: "2025-01-10T14:30:00Z", actor: "Priya Patel" },
      { action: "Assigned to Officer", date: "2025-01-11T09:00:00Z", actor: "Admin" },
      { action: "Work Started", date: "2025-01-12T10:00:00Z", actor: "Amit Kumar" },
      { action: "Resolved", date: "2025-01-14T16:45:00Z", actor: "Amit Kumar" }
    ]
  },
  {
    id: "CMP-004",
    title: "Garbage not collected for a week",
    description: "Municipal garbage truck hasn't collected waste from our colony for the past week.",
    category: "Sanitation",
    priority: "high",
    status: "pending",
    citizen_id: 1,
    citizen_name: "Rahul Sharma",
    citizen_email: "rahul@example.com",
    citizen_phone: "+91 98765 43210",
    officer_id: null,
    officer_name: null,
    department_id: 4,
    created_at: "2025-01-19T09:00:00Z",
    updated_at: "2025-01-19T09:00:00Z",
    assigned_at: null,
    resolved_at: null,
    images: [],
    remarks: [],
    timeline: [
      { action: "Complaint Submitted", date: "2025-01-19T09:00:00Z", actor: "Rahul Sharma" }
    ]
  },
  {
    id: "CMP-005",
    title: "Low voltage in Sector 15",
    description: "Voltage fluctuations causing damage to electronic appliances.",
    category: "Electricity",
    priority: "medium",
    status: "pending",
    citizen_id: 3,
    citizen_name: "Amit Verma",
    citizen_email: "amit@example.com",
    citizen_phone: "+91 98765 43230",
    officer_id: null,
    officer_name: null,
    department_id: 3,
    created_at: "2025-01-20T11:30:00Z",
    updated_at: "2025-01-20T11:30:00Z",
    assigned_at: null,
    resolved_at: null,
    images: [],
    remarks: [],
    timeline: [
      { action: "Complaint Submitted", date: "2025-01-20T11:30:00Z", actor: "Amit Verma" }
    ]
  }
];

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to validate admin access
const validateAdminAccess = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  if (currentUser.role !== 'admin') {
    throw new Error('Access denied. Admin privileges required.');
  }
  return currentUser;
};

// Get all complaints for admin's department
export const getDepartmentComplaints = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status_filter', filters.status);
  if (filters.priority) params.append('priority_filter', filters.priority);
  if (filters.search) params.append('search', filters.search);
  
  return request(`/complaints?${params.toString()}`);
};

// Get single complaint by ID
export const getComplaintById = async (id) => {
  return request(`/complaints/${id}`);
};

// Assign complaint to officer
export const assignComplaint = async (complaintId, officerId) => {
  return request(`/admin/assign?complaint_id=${complaintId}`, {
    method: 'POST',
    body: { officer_id: officerId }
  });
};

// Get all officers in admin's department
export const getOfficers = async () => {
  return request('/admin/officers');
};

// Add new officer
export const addOfficer = async (officerData) => {
  return request('/admin/officers', {
    method: 'POST',
    body: officerData
  });
};

// Update officer
export const updateOfficer = async (officerId, officerData) => {
  return request(`/admin/officers/${officerId}`, {
    method: 'PUT',
    body: officerData
  });
};

// Delete officer
export const deleteOfficer = async (officerId) => {
  return request(`/admin/officers/${officerId}`, {
    method: 'DELETE'
  });
};

// Get department analytics
export const getDepartmentAnalytics = async () => {
  return request('/admin/analytics');
};

// Get department info
export const getDepartmentInfo = async () => {
  return request('/admin/department-info');
};

// Update complaint status
export const updateComplaintStatus = async (complaintId, status, remark = '') => {
  return request(`/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: { status, remark }
  });
};