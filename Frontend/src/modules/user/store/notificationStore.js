import { create } from 'zustand';
import api from '@/lib/axios';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/notifications');
            if (data.success) {
                set({
                    notifications: data.notifications,
                    unreadCount: data.notifications.filter(n => !n.isRead).length
                });
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        } finally {
            set({ loading: false });
        }
    },

    addNotification: (notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    markAsRead: async (id) => {
        try {
            // Optimistic update
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));

            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Mark read error:", error);
            // Revert if needed, but keeping simple for now
        }
    },

    deleteNotification: async (id) => {
        try {
            const notif = get().notifications.find(n => n._id === id);
            const wasUnread = notif && !notif.isRead;

            set(state => ({
                notifications: state.notifications.filter(n => n._id !== id),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            }));

            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error("Delete notification error:", error);
        }
    }
}));
