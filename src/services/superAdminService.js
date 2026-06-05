// src/services/superAdminService.js
import { getCurrentUser } from './authService';
import request from './api';

// ==================== MOCK DATA ====================

// Mock departments data
let MOCK_DEPARTMENTS = [
  { id: 1, name: "Roads & Infrastructure", icon: "road", complaint_count: 45, resolved_count: 32, admin_id: 6, admin_name: "Dr. Mehta", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Water Supply", icon: "droplet", complaint_count: 38, resolved_count: 28, admin_id: 6, admin_name: "Dr. Mehta", created_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Electricity", icon: "zap", complaint_count: 67, resolved_count: 51, admin_id: 6, admin_name: "Dr. Mehta", created_at: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Sanitation", icon: "trash", complaint_count: 52, resolved_count: 41, admin_id: 6, admin_name: "Dr. Mehta", created_at: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Public Safety", icon: "shield", complaint_count: 23, resolved_count: 18, admin_id: null, admin_name: null, created_at: "2024-02-01T00:00:00Z" },
];

// Mock all users
let MOCK_USERS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", role: "citizen", status: "active", created_at: "2024-01-01T00:00:00Z", department_id: null },
  { id: 2, name: "Priya Patel", email: "priya@example.com", role: "citizen", status: "active", created_at: "2024-01-02T00:00:00Z", department_id: null },
  { id: 3, name: "Amit Kumar", email: "amit@example.com", role: "officer", status: "active", created_at: "2024-01-03T00:00:00Z", department_id: 1 },
  { id: 4, name: "Neha Singh", email: "neha@example.com", role: "officer", status: "active", created_at: "2024-01-04T00:00:00Z", department_id: 1 },
  { id: 5, name: "Vikram Rathore", email: "vikram@example.com", role: "officer", status: "active", created_at: "2024-01-05T00:00:00Z", department_id: 2 },
  { id: 6, name: "Dr. Mehta", email: "mehta@example.com", role: "admin", status: "active", created_at: "2024-01-01T00:00:00Z", department_id: 1 },
  { id: 7, name: "Super Admin", email: "admin@system.com", role: "super_admin", status: "active", created_at: "2024-01-01T00:00:00Z", department_id: null },
];

// Mock system categories
let MOCK_CATEGORIES = [
  { id: 1, name: "Roads & Infrastructure", icon: "road", active: true },
  { id: 2, name: "Water Supply", icon: "droplet", active: true },
  { id: 3, name: "Electricity", icon: "zap", active: true },
  { id: 4, name: "Sanitation", icon: "trash", active: true },
  { id: 5, name: "Public Safety", icon: "shield", active: true },
  { id: 6, name: "Healthcare", icon: "hospital", active: true },
  { id: 7, name: "Education", icon: "book", active: true },
];

// Mock priorities
let MOCK_PRIORITIES = [
  { id: 1, name: "Low", level: 1, active: true },
  { id: 2, name: "Medium", level: 2, active: true },
  { id: 3, name: "High", level: 3, active: true },
  { id: 4, name: "Emergency", level: 4, active: true },
];

// Mock all complaints (across all departments)
let MOCK_ALL_COMPLAINTS = [
  { id: "CMP-001", title: "Broken street light", category: "Electricity", priority: "high", status: "in_progress", department_id: 3, department_name: "Electricity", created_at: "2025-01-15T10:30:00Z", resolved_at: null },
  { id: "CMP-002", title: "Water leakage", category: "Water Supply", priority: "emergency", status: "assigned", department_id: 2, department_name: "Water Supply", created_at: "2025-01-17T08:15:00Z", resolved_at: null },
  { id: "CMP-003", title: "Potholes near mall", category: "Roads & Infrastructure", priority: "high", status: "resolved", department_id: 1, department_name: "Roads & Infrastructure", created_at: "2025-01-10T14:30:00Z", resolved_at: "2025-01-14T16:45:00Z" },
  { id: "CMP-004", title: "Garbage collection", category: "Sanitation", priority: "high", status: "pending", department_id: 4, department_name: "Sanitation", created_at: "2025-01-19T09:00:00Z", resolved_at: null },
];

// ==================== UTILITIES ====================
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const validateSuperAdmin = () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required');
  }
  return currentUser;
};

// ==================== DEPARTMENT MANAGEMENT ====================
export const getAllDepartments = async () => {
  return request('/admin/departments');
};

export const createDepartment = async (deptData) => {
  return request('/admin/departments', {
    method: 'POST',
    body: deptData
  });
};

export const updateDepartment = async (deptId, deptData) => {
  return request(`/admin/departments/${deptId}`, {
    method: 'PUT',
    body: deptData
  });
};

export const deleteDepartment = async (deptId) => {
  return request(`/admin/departments/${deptId}`, {
    method: 'DELETE'
  });
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = async () => {
  return request('/admin/users');
};

export const createUser = async (userData) => {
  // Translate to registration request
  return request('/auth/register', {
    method: 'POST',
    body: {
      name: userData.name,
      email: userData.email,
      password: userData.password || 'demo123',
      role: userData.role,
      department_id: userData.department_id
    }
  });
};

export const updateUserRole = async (userId, role, departmentId = null) => {
  const params = new URLSearchParams({ role });
  if (departmentId) params.append('department_id', departmentId);
  return request(`/admin/users/${userId}/role?${params.toString()}`, {
    method: 'PUT'
  });
};

export const updateUserStatus = async (userId, status) => {
  return request(`/admin/users/${userId}/status?status=${status}`, {
    method: 'PUT'
  });
};

export const deleteUser = async (userId) => {
  return request(`/admin/users/${userId}`, {
    method: 'DELETE'
  });
};

// ==================== SYSTEM ANALYTICS ====================
export const getSystemAnalytics = async () => {
  return request('/admin/super-analytics');
};

// ==================== SYSTEM SETTINGS ====================

// Categories
export const getCategories = async () => {
  return request('/admin/categories');
};

export const addCategory = async (categoryData) => {
  return request('/admin/categories', {
    method: 'POST',
    body: categoryData
  });
};

export const updateCategory = async (categoryId, categoryData) => {
  return request(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: categoryData
  });
};

export const deleteCategory = async (categoryId) => {
  return request(`/admin/categories/${categoryId}`, {
    method: 'DELETE'
  });
};

// Priorities
export const getPriorities = async () => {
  return [
    { id: 1, name: "Low", level: 1, active: true },
    { id: 2, name: "Medium", level: 2, active: true },
    { id: 3, name: "High", level: 3, active: true },
    { id: 4, name: "Emergency", level: 4, active: true }
  ];
};

export const updatePriority = async (priorityId, priorityData) => {
  return { id: priorityId, ...priorityData, active: true };
};