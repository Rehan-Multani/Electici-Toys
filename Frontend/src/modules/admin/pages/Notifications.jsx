import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    ShoppingBag,
    AlertCircle,
    Star,
    Zap,
    CheckCircle,
    X,
    Filter
} from 'lucide-react';
import { Button } from '../../user/components/ui/button';
import { Badge } from '../../user/components/ui/badge';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications/admin');
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Fetch admin notifications failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (socket && socket.connected) {
            const handleAdminNotification = (notif) => {
                setNotifications(prev => [notif, ...prev]);
            };
            socket.on("admin-notification", handleAdminNotification);

            return () => {
                socket.off("admin-notification", handleAdminNotification);
            };
        }
    }, []);

    const markAllRead = async () => {
        // Not optimal to call API for each but for now client side update visible
        // Or implement bulk mark read endpoint
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const removeNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const toggleRead = async (id) => {
        try {
            // Optimistic
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Mark read failed", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'stock': return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
            case 'review': return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' };
            default: return { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Notifications</h1>
                    <p className="text-muted-foreground font-medium italic">Stay updated with your toy kingdom ({notifications.filter(n => !n.isRead).length} unread)</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={markAllRead}
                        className="rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                    >
                        Mark All as Read
                    </Button>
                </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] overflow-hidden">
                <div className="divide-y divide-secondary/10">
                    <AnimatePresence mode='popLayout'>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const style = getIcon(notif.type);
                                const Icon = style.icon;

                                return (
                                    <motion.div
                                        key={notif._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`p-8 flex gap-6 items-start transition-colors relative group ${notif.isRead ? 'bg-transparent text-muted-foreground' : 'bg-background/40'}`}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}

                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color} border border-current opacity-20`}>
                                            <Icon className="h-6 w-6" />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`text-[8px] uppercase tracking-widest px-2 ${notif.isRead ? 'opacity-50' : ''}`}>
                                                    {notif.type}
                                                </Badge>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                                    {format(new Date(notif.createdAt), 'MMM dd, hh:mm a')}
                                                </span>
                                            </div>
                                            <h4 className={`text-lg font-black italic uppercase tracking-tighter ${notif.isRead ? 'opacity-70' : ''}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-sm font-medium italic leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleRead(notif._id)}
                                                className="p-2 hover:bg-secondary/20 rounded-xl transition-all"
                                                title={notif.isRead ? "Mark as unread" : "Mark as read"}
                                            >
                                                {notif.isRead ? <Bell className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                            </button>
                                            <button
                                                onClick={() => removeNotification(notif._id)}
                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center">
                                <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">All caught up!</h3>
                                <p className="text-muted-foreground italic mt-2">No new notifications at the moment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Zap className="h-8 w-8 text-primary animate-pulse" />
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight italic">Push Notifications</p>
                        <p className="text-xs text-muted-foreground italic">Enable browser alerts to never miss a sale!</p>
                    </div>
                </div>
                <Button className="rounded-full font-black italic tracking-widest uppercase shadow-lg shadow-primary/10">
                    Enable Alerts
                </Button>
            </div>
        </div>
    );
}
