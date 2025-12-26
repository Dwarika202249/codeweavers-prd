import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

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
};

// Export the axios instance for custom requests
export default api;
