'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, LoginCredentials, SignupData, User as ApiUser, setLogoutCallback } from './api';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | void>;
  getProfile: () => Promise<ApiUser>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    // Clear localStorage
    localStorage.removeItem('vms_user');
    localStorage.removeItem('vms_token');
    localStorage.removeItem('vms_refresh_token');

    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    // Register logout callback for token expiration handling
    setLogoutCallback(logout);

    // Check if user is already logged in
    const storedUser = localStorage.getItem('vms_user');
    const storedToken = localStorage.getItem('vms_token');
    const storedRefreshToken = localStorage.getItem('vms_refresh_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);
  console.log(response);
  
      const authUser: AuthUser = {
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role
      };

      // Save to state
      setUser(authUser);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      // Save to localStorage
      localStorage.setItem('vms_user', JSON.stringify(authUser));
      localStorage.setItem('vms_token', response.accessToken);
      localStorage.setItem('vms_refresh_token', response.refreshToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.signup(userData);

      const authUser: AuthUser = {
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role
      };

      // Save to state
      setUser(authUser);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      // Save to localStorage
      localStorage.setItem('vms_user', JSON.stringify(authUser));
      localStorage.setItem('vms_token', response.accessToken);
      localStorage.setItem('vms_refresh_token', response.refreshToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.warn('No refresh token available, logging out');
      logout();
      throw new Error('No refresh token available');
    }

    try {
      const response = await authAPI.refreshToken(refreshToken);

      // Update token in state and localStorage
      setToken(response.accessToken);
      localStorage.setItem('vms_token', response.accessToken);

      console.log('Token refreshed successfully');
      return response.accessToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      // If refresh token is invalid, log the user out
      logout();
      throw err;
    }
  };

  const getProfile = async (): Promise<ApiUser> => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      return await authAPI.getProfile(token);
    } catch (err) {
      // If token is expired, try to refresh it
      if (err instanceof Error && err.message.includes('expired')) {
        await refreshAccessToken();
        // Retry with new token
        if (token) {
          return await authAPI.getProfile(token);
        }
      }
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    try {
      return await authAPI.forgotPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    try {
      return await authAPI.resetPassword(resetToken, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      return await authAPI.changePassword(currentPassword, newPassword, token);
    } catch (err) {
      // If token is expired, try to refresh it
      if (err instanceof Error && err.message.includes('expired')) {
        await refreshAccessToken();
        // Retry with new token
        if (token) {
          return await authAPI.changePassword(currentPassword, newPassword, token);
        }
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      isLoading,
      error,
      login,
      signup,
      logout,
      refreshAccessToken,
      getProfile,
      forgotPassword,
      resetPassword,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
