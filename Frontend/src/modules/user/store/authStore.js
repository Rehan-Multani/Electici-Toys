import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: async (email, password) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    if (response.data.success) {
                        // Merge token into user object for persistence if needed, 
                        // or ensure the structure matches what the axios interceptor expects
                        const userData = { ...response.data.data, token: response.data.token };
                        set({ user: userData, isAuthenticated: true });
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Login failed'
                    };
                }
            },

            register: async (name, email, password) => {
                try {
                    const response = await api.post('/auth/register', {
                        fullName: name,
                        email,
                        password
                    });
                    if (response.data.success) {
                        return { success: true, message: response.data.message };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Registration failed'
                    };
                }
            },

            verifyOtp: async (email, otp) => {
                try {
                    const response = await api.post('/auth/verify', { email, otp });
                    if (response.data.success) {
                        const userData = { ...response.data.data, token: response.data.token };
                        set({ user: userData, isAuthenticated: true });
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Verification failed'
                    };
                }
            },

            logout: () => set({ user: null, isAuthenticated: false }),

            updateProfile: async (updates) => {
                try {
                    const response = await api.put('/auth/update-profile', updates);
                    if (response.data.success) {
                        set((state) => ({
                            user: { ...state.user, ...response.data.data }
                        }));
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Update failed'
                    };
                }
            },
        }),
        {
            name: 'auth-storage', // unique name for localStorage key
        }
    )
);
