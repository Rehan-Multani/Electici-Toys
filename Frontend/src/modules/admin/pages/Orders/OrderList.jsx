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
    ShoppingBag,
    XCircle,
    RotateCcw,
    Banknote
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

            // Special filters for cancel/return/refund
            let matchesStatus = true;
            if (statusFilter === 'All') {
                matchesStatus = true;
            } else if (statusFilter === 'CancelRequests') {
                matchesStatus = o.cancelRequestedAt && o.cancelApprovedByAdmin === null;
            } else if (statusFilter === 'ReturnRequests') {
                matchesStatus = o.returnRequestedAt && o.returnApprovedByAdmin === null;
            } else if (statusFilter === 'PendingRefunds') {
                matchesStatus = o.refundStatus === 'Processing';
            } else {
                matchesStatus = o.status === statusFilter;
            }

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
        <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 md:mb-2">Orders</h1>
                <p className="text-xs md:text-base text-muted-foreground font-medium italic">Track and manage your customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
                {[
                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-primary' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500' },
                    { label: 'Processing', value: orders.filter(o => o.status === 'Processing').length, icon: AlertCircle, color: 'text-blue-500' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Cancel Requests', value: orders.filter(o => o.cancelRequestedAt && o.cancelApprovedByAdmin === null).length, icon: XCircle, color: 'text-red-500' },
                    { label: 'Return Requests', value: orders.filter(o => o.returnRequestedAt && o.returnApprovedByAdmin === null).length, icon: RotateCcw, color: 'text-purple-500' },
                    { label: 'Pending Refunds', value: orders.filter(o => o.refundStatus === 'Processing').length, icon: Banknote, color: 'text-cyan-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="relative p-4 md:p-6 bg-white/60 backdrop-blur-md border border-white/60 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-transparent to-${stat.color.replace('text-', '')}/10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-${stat.color.replace('text-', '')}/10 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                        </div>

                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{stat.label}</p>
                        <h3 className="text-xl md:text-3xl font-black italic tracking-tighter mt-1 text-foreground">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-secondary/10 p-3 md:p-4 rounded-3xl border border-secondary/20 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="SEARCH ORDERS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-secondary/20 rounded-2xl pl-12 pr-4 py-2 md:py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs"
                    />
                </div>

                <div className="flex flex-wrap gap-2 p-1 bg-background rounded-2xl border border-secondary/20">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${statusFilter === status
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'hover:bg-secondary/20'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Cancel/Return Quick Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setStatusFilter('CancelRequests')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === 'CancelRequests' ? 'bg-red-500 text-white border-red-500' : 'border-red-500/30 text-red-500 hover:bg-red-500/10'}`}
                    >
                        <XCircle className="inline h-3 w-3 mr-1" /> Cancel Requests
                    </button>
                    <button
                        onClick={() => setStatusFilter('ReturnRequests')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === 'ReturnRequests' ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-500/30 text-purple-500 hover:bg-purple-500/10'}`}
                    >
                        <RotateCcw className="inline h-3 w-3 mr-1" /> Return Requests
                    </button>
                    <button
                        onClick={() => setStatusFilter('PendingRefunds')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === 'PendingRefunds' ? 'bg-cyan-500 text-white border-cyan-500' : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'}`}
                    >
                        <Banknote className="inline h-3 w-3 mr-1" /> Pending Refunds
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-secondary/5 rounded-[2.5rem] border border-secondary/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/10">
                            <tr>
                                <th className="px-4 py-3 md:px-6 md:py-4">Order ID</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Customer</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Date</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Total</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Actions</th>
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
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <p className="font-black italic tracking-tighter text-primary text-xs md:text-sm">{order.displayId}</p>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <div>
                                                <p className="font-bold uppercase italic tracking-tight text-xs md:text-sm">{order.customer}</p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.email}</p>
                                                    <p className="text-[10px] text-primary font-black italic">{order.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                                {format(new Date(order.date), 'MMM dd, yyyy')}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <p className="font-black italic text-xs md:text-sm">₹{(order.grandTotal || order.total).toLocaleString()}</p>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <Badge variant={getStatusVariant(order.status)} className="text-[8px] md:text-[10px] uppercase tracking-widest flex items-center w-fit">
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-full hover:bg-primary/10 text-primary font-black italic tracking-widest uppercase text-[8px] md:text-[10px] px-2 md:px-3 h-8"
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                >
                                                    Details <ArrowRight className="ml-1 md:ml-2 h-3 w-3 text-primary" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20 h-8 w-8">
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
                    <div className="p-10 md:p-20 text-center flex flex-col items-center">
                        <div className="h-16 w-16 md:h-20 md:w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">No orders found</h3>
                        <p className="text-muted-foreground italic mt-2">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
