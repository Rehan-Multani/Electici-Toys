import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminOrderStore } from '../../store/adminOrderStore';
import { Badge } from '../../../user/components/ui/badge';
import { Button } from '../../../user/components/ui/button';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowRight,
    ShoppingBag
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../../../user/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function OrderList() {
    const { orders, updateOrderStatus, fetchOrders } = useAdminOrderStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(o.displayId || o.id).toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [orders, searchQuery, statusFilter]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="h-3 w-3 mr-1" />;
            case 'Processing': return <AlertCircle className="h-3 w-3 mr-1" />;
            case 'Shipped': return <Truck className="h-3 w-3 mr-1" />;
            case 'Delivered': return <CheckCircle className="h-3 w-3 mr-1" />;
            default: return null;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Pending': return 'secondary';
            case 'Processing': return 'outline';
            case 'Shipped': return 'default';
            case 'Delivered': return 'success';
            default: return 'outline';
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Orders</h1>
                <p className="text-muted-foreground font-medium italic">Track and manage your customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-primary' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500' },
                    { label: 'Processing', value: orders.filter(o => o.status === 'Processing').length, icon: AlertCircle, color: 'text-blue-500' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle, color: 'text-emerald-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="relative p-6 bg-white/60 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-${stat.color.replace('text-', '')}/10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className={`h-12 w-12 rounded-2xl bg-${stat.color.replace('text-', '')}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{stat.label}</p>
                        <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-foreground">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-secondary/10 p-4 rounded-3xl border border-secondary/20 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="SEARCH ORDERS BY ID OR CUSTOMER..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-secondary/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                    />
                </div>

                <div className="flex gap-2 p-1 bg-background rounded-2xl border border-secondary/20">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'hover:bg-secondary/20'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-secondary/5 rounded-[2.5rem] border border-secondary/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/10">
                            <tr>
                                <th className="px-8 py-6">Order ID</th>
                                <th className="px-8 py-6">Customer</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Total</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            <AnimatePresence mode='popLayout'>
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-secondary/10 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="font-black italic tracking-tighter text-primary">{order.displayId}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold uppercase italic tracking-tight">{order.customer}</p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.email}</p>
                                                    <p className="text-[10px] text-primary font-black italic">{order.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                                {format(new Date(order.date), 'MMM dd, yyyy')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black italic">₹{(order.grandTotal || order.total).toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant={getStatusVariant(order.status)} className="text-[10px] uppercase tracking-widest flex items-center w-fit">
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-full hover:bg-primary/10 text-primary font-black italic tracking-widest uppercase text-[10px]"
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                >
                                                    Details <ArrowRight className="ml-2 h-3 w-3 text-primary" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-secondary/20">
                                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Processing')} className="rounded-xl px-4 py-3 cursor-pointer text-xs font-bold uppercase tracking-widest">
                                                            Mark Processing
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Shipped')} className="rounded-xl px-4 py-3 cursor-pointer text-xs font-bold uppercase tracking-widest">
                                                            Mark Shipped
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Delivered')} className="rounded-xl px-4 py-3 cursor-pointer text-xs font-bold uppercase tracking-widest">
                                                            Mark Delivered
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center">
                        <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">No orders found</h3>
                        <p className="text-muted-foreground italic mt-2">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
