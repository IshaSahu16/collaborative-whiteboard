import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile as updateProfileApi,
  updatePassword as updatePasswordApi,
} from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await registerUser(data);
      if (res.data?.token && typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', res.data.token);
      }
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  // Login
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginUser(data);
      if (res.data?.token && typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', res.data.token);
      }
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('authToken');
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  // Get current logged in user — call on app load
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await getCurrentUser();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateProfileApi(data);
      set({ user: res.data, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  // Update password
  updatePassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await updatePasswordApi(data);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;