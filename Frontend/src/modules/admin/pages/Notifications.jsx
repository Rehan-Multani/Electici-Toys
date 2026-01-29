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

        // Connect socket if not already connected (admin panel doesn't auto-connect like user app)
        if (!socket.connected) {
            socket.connect();
            console.log("Admin: Connecting socket...");
        }

        const handleAdminNotification = (notif) => {
            console.log("Admin received notification:", notif);
            setNotifications(prev => [notif, ...prev]);
        };

        socket.on("admin-notification", handleAdminNotification);

        return () => {
            socket.off("admin-notification", handleAdminNotification);
        };
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
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 md:mb-2">Notifications</h1>
                    <p className="text-xs md:text-base text-muted-foreground font-medium italic">Stay updated with your toy kingdom ({notifications.filter(n => !n.isRead).length} unread)</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={markAllRead}
                        className="rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 h-auto py-2"
                    >
                        Mark All as Read
                    </Button>
                </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-[2rem] overflow-hidden">
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
                                        className={`p-4 md:p-6 flex gap-4 md:gap-6 items-start transition-colors relative group ${notif.isRead ? 'bg-transparent text-muted-foreground' : 'bg-background/40'}`}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}

                                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color} border border-current opacity-20`}>
                                            <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>

                                        <div className="flex-1 space-y-0.5 md:space-y-1">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Badge variant="outline" className={`text-[8px] uppercase tracking-widest px-2 ${notif.isRead ? 'opacity-50' : ''}`}>
                                                    {notif.type}
                                                </Badge>
                                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                                    {format(new Date(notif.createdAt), 'MMM dd, hh:mm a')}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm md:text-lg font-black italic uppercase tracking-tighter ${notif.isRead ? 'opacity-70' : ''}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-xs md:text-sm font-medium italic leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1 md:gap-2">
                                            <button
                                                onClick={() => toggleRead(notif._id)}
                                                className="p-1.5 md:p-2 hover:bg-secondary/20 rounded-xl transition-all"
                                                title={notif.isRead ? "Mark as unread" : "Mark as read"}
                                            >
                                                {notif.isRead ? <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" />}
                                            </button>
                                            <button
                                                onClick={() => removeNotification(notif._id)}
                                                className="p-1.5 md:p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <div className="p-10 md:p-20 text-center flex flex-col items-center">
                                <div className="h-16 w-16 md:h-20 md:w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-foreground">All caught up!</h3>
                                <p className="text-muted-foreground italic mt-2 text-xs md:text-base">No new notifications at the moment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-primary/5 p-4 md:p-8 rounded-[2rem] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse flex-shrink-0" />
                    <div>
                        <p className="text-xs md:text-sm font-black uppercase tracking-tight italic">Push Notifications</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground italic">Enable browser alerts to never miss a sale!</p>
                    </div>
                </div>
                <Button className="w-full md:w-auto rounded-full font-black italic tracking-widest uppercase shadow-lg shadow-primary/10 text-xs md:text-sm py-2 md:py-4 h-auto">
                    Enable Alerts
                </Button>
            </div>
        </div>
    );
}
