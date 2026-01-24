import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminAnalyticsStore = create()(
    persist(
        (set, get) => ({
            dashboardData: null,
            analyticsData: null,
            loading: false,
            error: null,

            fetchDashboard: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/dashboard');
                    set({ dashboardData: response.data });
                } catch (error) {
                    console.error("Dashboard fetch error:", error);
                    set({ error: error.message });
                } finally {
                    set({ loading: false });
                }
            },

            fetchAnalytics: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/analytics-report');
                    set({ analyticsData: response.data });
                } catch (error) {
                    console.error("Analytics fetch error:", error);
                    set({ error: error.message });
                } finally {
                    set({ loading: false });
                }
            },

            getSummary: () => {
                const dashboard = get().dashboardData;
                if (!dashboard) {
                    return {
                        totalRevenue: 0,
                        totalOrders: 0,
                        activeProducts: 0,
                        avgOrderValue: 0,
                        growth: 0
                    };
                }
                return {
                    totalRevenue: dashboard.totalRevenue || 0,
                    totalOrders: dashboard.recentOrders?.length || 0, // This is just recent orders count, might need total orders count from backend
                    activeProducts: dashboard.activeProducts || 0,
                    avgOrderValue: dashboard.avgOrderValue || 0,
                    growth: 0
                };
            }
        }),
        {
            name: 'admin-analytics-storage-v2', // Updated version
        }
    )
);
