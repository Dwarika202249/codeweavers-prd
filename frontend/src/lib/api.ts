import axios, { type AxiosError} from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export API base used for browser-facing links (e.g., downloads)
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Token storage key
const TOKEN_KEY = 'cw_auth_token';

// Get token from storage
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Set token in storage
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove token from storage
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      removeToken();
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=true';
      }
    }

    // Extract error message
    const message = 
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

// API Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  termsAccepted?: boolean;
  // Login streaks (optional, provided by /auth/me)
  currentLoginStreak?: number;
  longestLoginStreak?: number;
  loginDays?: string[]; // ISO dates YYYY-MM-DD of recent login days
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: 'course' | 'project' | 'general' | 'other';
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: {
    referenceId: string;
  };
}

export interface ContactInquiryNote {
  note: string;
  addedBy?: string;
  createdAt?: string;
}

export interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  referenceId?: string;
  createdAt: string;
  adminNotes?: ContactInquiryNote[];
}

export interface ContactInquiryResponse {
  success: boolean;
  data: {
    contacts: ContactInquiry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; termsAccepted: boolean }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  googleLogin: (credential: string) =>
    api.post<AuthResponse>('/auth/google', { credential }),
  
  getMe: () =>
    api.get<{ success: boolean; data: { user: User } }>('/auth/me'),
  
  updateProfile: (data: { name: string }) =>
    api.put<{ success: boolean; data: { user: User } }>('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ success: boolean; message: string }>('/auth/password', data),
  deleteAccount: (data?: { currentPassword?: string }) =>
    api.delete<{ success: boolean; message: string }>('/auth/account', { data }),
};

// Contact API
export const contactAPI = {
  submit: (data: ContactFormData) =>
    api.post<ContactResponse>('/contact', data),
  getAll: (params?: { page?: number; limit?: number; status?: string; subject?: string }) =>
    api.get<ContactInquiryResponse>('/contact', { params }),
  getById: (id: string) =>
    api.get<{ success: boolean; data: { contact: ContactInquiry } }>(`/contact/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put<{ success: boolean; message?: string; data?: { contact: ContactInquiry } }>(`/contact/${id}/status`, { status }),
  addNote: (id: string, note: string) =>
    api.post<{ success: boolean; message?: string; data?: { contact: ContactInquiry } }>(`/contact/${id}/notes`, { note }),
  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/contact/${id}`),
};

// Course Types & API
export interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty?: string; // legacy alias used in some UI
  featured?: boolean;
  mode?: string;
  batchSize?: string | number;
  curriculum?: any[];
  topics?: string[];
  targetAudience?: string[];
  price?: number;
  prerequisites?: string[];
  learningOutcomes?: string[];
  schedule?: string;
  published?: boolean;
  coverImage?: string;
  coverImageThumb?: string;
  instructor?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseListResponse {
  success: boolean;
  data: {
    courses: Course[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export const courseAPI = {
  getAll: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get<CourseListResponse>('/courses', { params }),
  getById: (id: string) =>
    api.get<{ success: boolean; data: { course: Course } }>(`/courses/${id}`),
  getBySlug: (slug: string) =>
    api.get<{ success: boolean; data: { course: Course } }>(`/courses/slug/${slug}`),
  create: (data: Partial<Course>) =>
    api.post<{ success: boolean; data: { course: Course } }>(`/courses`, data),
  update: (id: string, data: Partial<Course>) =>
    api.put<{ success: boolean; data: { course: Course } }>(`/courses/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/courses/${id}`),
  topByEnrollments: (params?: { days?: number; limit?: number }) => api.get<{ success: boolean; data: { top: { courseId: string; count: number; title?: string; slug?: string }[] } }>(`/courses/stats/top-enrollments`, { params }),
};

// Uploads
export const uploadsAPI = {
  uploadCourseImage: (form: FormData) => api.post<{ success: boolean; data: { url: string; thumbnailUrl?: string } }>(`/uploads/courses`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Payments API
export const paymentsAPI = {
  createCheckoutSession: (data: { courseId?: string; courseSlug?: string }) => api.post<{ success: boolean; data: { url?: string; id?: string } }>(`/payments/create-checkout-session`, data),
  getSession: (id: string) => api.get<{ success: boolean; data: { session: any } }>(`/payments/session/${id}`),
  revenueTrend: (params?: { days?: number }) => api.get<{ success: boolean; data: { days: { date: string; revenue: number; count: number }[] } }>(`/payments/stats/revenue`, { params }),
};

// Admin settings API
export const adminSettingsAPI = {
  get: () => api.get<{ success: boolean; data: { settings: any } }>(`/admin/settings`),
  update: (data: any) => api.put<{ success: boolean; data: { settings: any } }>(`/admin/settings`, data),
};

export const enrollmentAPI = {
  enroll: (data: { courseId?: string; courseSlug?: string }) =>
    api.post<{ success: boolean; data: { enrollment: any } }>('/enrollments', data),
  getMy: () => api.get<{ success: boolean; data: { enrollments: any[] } }>('/enrollments'),
  getAll: (params?: { page?: number; limit?: number }) => api.get<{ success: boolean; data: { enrollments: any[] } }>('/enrollments', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}`),
  dailyTrend: (params?: { days?: number; courseId?: string }) => api.get<{ success: boolean; data: { days: { date: string; count: number }[] } }>(`/enrollments/stats/daily`, { params }),
  getCertificate: (id: string) => api.get<{ success: boolean; data: { certificate: any } }>(`/enrollments/${id}/certificate`),
  applyCertificate: (id: string, data?: { note?: string }) => api.post<{ success: boolean; data: { certificate: any } }>(`/enrollments/${id}/certificates`, data),
  getMyCertificates: () => api.get<{ success: boolean; data: { certificates: any[] } }>(`/enrollments/certificates/my`),
  getAssignments: (id: string) => api.get<{ success: boolean; data: { assignments: any[] } }>(`/enrollments/${id}/assignments`),
  update: (id: string, data: any) => api.put<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}`, data),
  completeLesson: (id: string, payload: { moduleIndex: number; topic: string }) => api.post<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}/complete`, payload),
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/enrollments/${id}`),
  uploadAssignment: (id: string, formData: FormData) => api.post<{ success: boolean; data: { assignment: any } }>(`/enrollments/${id}/assignments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  requestRefund: (id: string) => api.post<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}/request-refund`),
  addNote: (id: string, note: string) => api.post<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}/notes`, { note }),
};

// Submissions API (student-facing)
export const submissionsAPI = {
  submit: (assignmentId: string, data: { enrollmentId: string; link?: string; notes?: string }) => api.post<{ success: boolean; data: { submission: any } }>(`/assignments/${assignmentId}/submissions`, data),
  submitFile: (assignmentId: string, form: FormData) => api.post<{ success: boolean; data: { submission: any } }>(`/assignments/${assignmentId}/submissions/file`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Future: add getMy / getByAssignment for students
};
// User admin APIs
export const userAdminAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }) =>
    api.get<{ success: boolean; data: { users: any[]; pagination?: any } }>('/users', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: { user: any } }>(`/users/${id}`),
  updateRole: (id: string, role: 'user' | 'admin') => api.put<{ success: boolean; data: { user: any } }>(`/users/${id}/role`, { role }),
  updateStatus: (id: string, isActive: boolean) => api.put<{ success: boolean; data: { user: any } }>(`/users/${id}/status`, { isActive }),
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/users/${id}`),
  stats: () => api.get<{ success: boolean; data: { stats: any } }>(`/users/stats/summary`),
  newUsersTrend: (params?: { days?: number }) => api.get<{ success: boolean; data: { days: { date: string; count: number }[] } }>(`/users/stats/new-users-trend`, { params }),
  // Server-side export (streamed as CSV)
  exportUsers: (params?: { search?: string; role?: string; isActive?: boolean; from?: string; to?: string; limit?: number }) =>
    api.get(`/export/users`, { params, responseType: 'blob' }),
};

// Admin Certificates APIs
export const adminCertificatesAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => api.get<{ success: boolean; data: { certificates: any[]; pagination?: any } }>(`/enrollments/certificates`, { params }),
  getById: (id: string) => api.get<{ success: boolean; data: { certificate: any } }>(`/enrollments/certificates/${id}`),
  issueUpload: (id: string, formData: FormData) => api.post<{ success: boolean; data: { certificate: any } }>(`/enrollments/certificates/${id}/issue`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  issueGenerate: (id: string) => api.post<{ success: boolean; data: { certificate: any } }>(`/enrollments/certificates/${id}/issue`, { generate: true }),
  reject: (id: string, notes?: string) => api.post<{ success: boolean; data: { certificate: any } }>(`/enrollments/certificates/${id}/reject`, { notes }),
};

// Admin Assignments APIs
export const adminAssignmentsAPI = {
  create: (data: { courseId: string; title: string; description?: string; dueDate?: string; allowResubmissions?: boolean; maxScore?: number }) => api.post<{ success: boolean; data: { assignment: any } }>(`/assignments`, data),
  getAll: (params?: { page?: number; limit?: number; courseId?: string; q?: string }) => api.get<{ success: boolean; data: { assignments: any[]; pagination?: any } }>(`/assignments`, { params }),
  getById: (id: string) => api.get<{ success: boolean; data: { assignment: any; submissionCount?: number } }>(`/assignments/${id}`),
  update: (id: string, data: any) => api.put<{ success: boolean; data: { assignment: any } }>(`/assignments/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/assignments/${id}`),
};

// Admin Submissions APIs
export const adminSubmissionsAPI = {
  getByAssignment: (id: string, params?: { page?: number; limit?: number; status?: string }) => api.get<{ success: boolean; data: { submissions: any[]; pagination?: any } }>(`/assignments/${id}/submissions`, { params }),
  grade: (id: string, data: { score?: number; feedback?: string; status?: 'graded'|'rejected' }) => api.patch<{ success: boolean; data: { submission: any } }>(`/assignments/submissions/${id}/grade`, data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: { limit?: number }) => api.get<{ success: boolean; data: { notifications: any[]; unreadCount: number } }>(`/notifications`, { params }),
  markRead: (id: string) => api.patch<{ success: boolean; data: { notification: any } }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ success: boolean }>(`/notifications/read-all`),
};

// Download APIs that require auth and blob response
export const downloadAPI = {
  certificate: (id: string) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
};

// Export the axios instance for custom requests
export default api;
