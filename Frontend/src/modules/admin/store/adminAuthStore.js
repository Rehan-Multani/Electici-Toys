import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminAuthStore = create(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,

            login: async (email, password, businessName) => {
                try {
                    // Call the new Merged Admin Login/Register Endpoint
                    const response = await api.post('/auth/admin-login', { email, password, businessName });
                    if (response.data.success) {
                        const user = response.data.data;
                        // Store admin data and token
                        set({ admin: { ...user, token: response.data.token }, isAuthenticated: true });
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return { success: false, error: error.response?.data?.message || 'Access failed' };
                }
            },

            logout: () => set({ admin: null, isAuthenticated: false }),

            updateProfile: async (updates) => {
                // Placeholder for update profile if needed
                set((state) => ({ admin: { ...state.admin, ...updates } }));
                return { success: true };
            },
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);
