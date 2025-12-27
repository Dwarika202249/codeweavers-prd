import axios, { type AxiosError} from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  register: (data: { name: string; email: string; password: string }) =>
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
  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/courses/${id}`),
};

export const enrollmentAPI = {
  enroll: (data: { courseId?: string; courseSlug?: string }) =>
    api.post<{ success: boolean; data: { enrollment: any } }>('/enrollments', data),
  getMy: () => api.get<{ success: boolean; data: { enrollments: any[] } }>('/enrollments'),
  getAll: (params?: { page?: number; limit?: number }) => api.get<{ success: boolean; data: { enrollments: any[] } }>('/enrollments', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}`),
  update: (id: string, data: any) => api.put<{ success: boolean; data: { enrollment: any } }>(`/enrollments/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/enrollments/${id}`),
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
  // Server-side export (streamed as CSV)
  exportUsers: (params?: { search?: string; role?: string; isActive?: boolean; from?: string; to?: string; limit?: number }) =>
    api.get(`/export/users`, { params, responseType: 'blob' }),
};

// Export the axios instance for custom requests
export default api;
