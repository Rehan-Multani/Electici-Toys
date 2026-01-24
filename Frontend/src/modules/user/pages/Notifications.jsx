import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ShoppingBag, Info, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { format } from 'date-fns';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const isUnread = !notification.isRead;

    const getIcon = () => {
        switch (notification.type) {
            case 'order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
            case 'promotion': return <AlertCircle className="w-5 h-5 text-purple-500" />;
            case 'system': return <Info className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
                isUnread
                    ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                    : "bg-card border-border/40 hover:border-border"
            )}
        >
            <div className="flex gap-4">
                <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    isUnread ? "bg-primary/10" : "bg-secondary/50"
                )}>
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h4 className={cn(
                                "font-bold text-sm leading-none mb-1",
                                isUnread ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {notification.message}
                            </p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/50 whitespace-nowrap">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isUnread && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkRead(notification._id)}
                                className="h-7 text-[10px] px-3 hover:bg-primary/10 hover:text-primary"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark as read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(notification._id)}
                            className="h-7 text-[10px] px-3 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {isUnread && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-glow animate-pulse" />
            )}
        </motion.div>
    );
};

const Notifications = () => {
    const { notifications, loading, fetchNotifications, markAsRead, deleteNotification } = useNotificationStore();

    // Initial fetch if empty? Or just rely on App.jsx? 
    // Better to fetch on mount to be sure
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (loading && notifications.length === 0) {
        return (
            <div className="pt-32 pb-12 min-h-screen container mx-auto px-6 flex justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-12 min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-foreground mb-1">
                            NOTIFICATIONS
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Stay updated with your orders and alerts
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <NotificationItem
                                    key={notif._id}
                                    notification={notif}
                                    onMarkRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl"
                            >
                                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-muted-foreground mb-2">No notifications yet</h3>
                                <p className="text-sm text-muted-foreground/50">
                                    When you get orders or updates, they'll appear here.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
export default Notifications;
