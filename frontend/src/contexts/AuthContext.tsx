import React, { useState, useEffect, useCallback } from 'react';
import { authAPI, setToken, getToken, removeToken } from '../lib/api';
import type { User } from '../lib/api';
import { AuthContext, type AuthContextType } from './AuthContextType';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
        } catch {
          // Token is invalid, remove it
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token } = response.data.data;
    setToken(token);
    // fetch full profile including login days and streaks
    try {
      const me = await authAPI.getMe();
      setUser(me.data.data.user);
    } catch (err) {
      // fallback to basic user if /me fails
      const basicUser = response.data.data.user;
      setUser(basicUser);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, termsAccepted: boolean) => {
    const response = await authAPI.register({ name, email, password, termsAccepted });
    const { token } = response.data.data;
    setToken(token);
    // fetch full profile after registering
    try {
      const me = await authAPI.getMe();
      setUser(me.data.data.user);
    } catch (err) {
      setUser(response.data.data.user);
    }
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const response = await authAPI.googleLogin(credential);
    const { token } = response.data.data;
    setToken(token);
    try {
      const me = await authAPI.getMe();
      setUser(me.data.data.user);
    } catch (err) {
      setUser(response.data.data.user);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
