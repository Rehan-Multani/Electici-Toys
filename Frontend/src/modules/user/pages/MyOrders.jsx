import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../store/orderStore';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, ArrowRight, ShoppingBag, MapPin, Calendar, XCircle, RotateCcw, AlertTriangle, X, CreditCard, Banknote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';

export function MyOrders() {
    const { orders, fetchOrders, requestCancel, requestReturn, loading } = useOrderStore();
    const { toast } = useToast();

    // Modal states
    const [cancelModal, setCancelModal] = useState({ open: false, order: null });
    const [returnModal, setReturnModal] = useState({ open: false, order: null });
    const [cancelReason, setCancelReason] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [refundDetails, setRefundDetails] = useState({
        refundMethod: 'Bank Transfer',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        upiId: ''
    });

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Check if cancel is allowed
    const canCancel = (order) => {
        const allowedStatuses = ['pending', 'processing'];
        return allowedStatuses.includes(order.status?.toLowerCase()) &&
            !order.cancelRequestedAt &&
            order.status?.toLowerCase() !== 'cancelled';
    };

    // Check if return is allowed (delivered + within 7 days)
    const canReturn = (order) => {
        if (order.status?.toLowerCase() !== 'delivered') return false;
        if (order.returnRequestedAt) return false;
        if (!order.deliveredAt) return false;

        const deliveryDate = new Date(order.deliveredAt);
        const now = new Date();
        const daysDiff = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
    };

    // Get days remaining for return
    const getReturnDaysRemaining = (order) => {
        if (!order.deliveredAt) return 0;
        const deliveryDate = new Date(order.deliveredAt);
        const now = new Date();
        const daysDiff = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));
        return Math.max(0, 7 - daysDiff);
    };

    // Check if order requires refund (online payment)
    const requiresRefund = (order) => {
        const onlineMethods = ['RAZORPAY', 'CARD', 'ONLINE'];
        return onlineMethods.includes(order.paymentMethod?.toUpperCase()) &&
            order.paymentStatus === 'Paid';
    };

    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            toast({ title: "Error", description: "Please enter a cancel reason", variant: "destructive" });
            return;
        }

        const refundData = requiresRefund(cancelModal.order) ? refundDetails : null;
        const result = await requestCancel(cancelModal.order.id, cancelReason, refundData);

        if (result.success) {
            toast({ title: "Success", description: result.message, variant: "success" });
            setCancelModal({ open: false, order: null });
            setCancelReason('');
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    };

    const handleReturnSubmit = async () => {
        if (!returnReason) {
            toast({ title: "Error", description: "Please select a return reason", variant: "destructive" });
            return;
        }

        const result = await requestReturn(returnModal.order.id, returnReason, refundDetails);

        if (result.success) {
            toast({ title: "Success", description: result.message, variant: "success" });
            setReturnModal({ open: false, order: null });
            setReturnReason('');
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    };

    const handleTrackOrder = (orderId, status) => {
        const statusMessages = {
            'pending': "We've received your order and it's awaiting confirmation.",
            'processing': "Your electric toys are being packed and prepared for deployment!",
            'shipped': "Your order is on the way! It has been handed over to our delivery partner.",
            'delivered': "Order delivered! Hope you enjoy your new electric toys! 🚀",
            'cancelled': "This order has been cancelled."
        };
        const message = statusMessages[status.toLowerCase()] || `Order is currently ${status.toUpperCase()}.`;
        toast({ title: "ORDER TRACKING", description: message, variant: "default" });
    };

    const getStatusBadge = (order) => {
        // Show cancel/return status if applicable
        if (order.cancelRequestedAt && order.cancelApprovedByAdmin === null) {
            return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">Cancel Pending</Badge>;
        }
        if (order.cancelApprovedByAdmin === false) {
            return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">Cancel Rejected</Badge>;
        }
        if (order.returnRequestedAt && order.returnApprovedByAdmin === null) {
            return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">Return Pending</Badge>;
        }
        if (order.returnApprovedByAdmin === false) {
            return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">Return Rejected</Badge>;
        }
        if (order.returnApprovedByAdmin === true) {
            return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">Return Approved</Badge>;
        }

        // Normal status
        return <Badge variant="outline" className="border-primary/50 text-foreground bg-primary/10">{order.status}</Badge>;
    };

    const getRefundBadge = (order) => {
        if (!order.refundStatus || order.refundStatus === 'NotRequired') return null;

        const colors = {
            'Pending': 'border-amber-500/50 text-amber-500 bg-amber-500/10',
            'Processing': 'border-blue-500/50 text-blue-500 bg-blue-500/10',
            'Completed': 'border-green-500/50 text-green-500 bg-green-500/10',
            'Rejected': 'border-red-500/50 text-red-500 bg-red-500/10'
        };

        return (
            <Badge variant="outline" className={colors[order.refundStatus] || ''}>
                Refund: {order.refundStatus}
            </Badge>
        );
    };

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="text-6xl grayscale opacity-50">📦</div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-muted-foreground">No orders yet</h2>
                <Link to="/products">
                    <Button>START COLLECTING</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-12 flex items-center gap-4">
                <Package className="h-10 w-10 text-primary" /> My Orders
            </h1>

            <div className="space-y-8">
                {orders.map((order, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={order.id}
                        className="bg-secondary/10 border border-secondary/20 rounded-[2rem] overflow-hidden"
                    >
                        {/* Order Header */}
                        <div className="bg-secondary/20 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-xl font-black tracking-tight">{order.orderId || order.id}</h3>
                                    {getStatusBadge(order)}
                                    {getRefundBadge(order)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(order.date), 'MMMM dd, yyyy')}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(order.date), 'h:mm a')}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black italic text-primary">₹{order.total.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                            </div>
                        </div>

                        {/* Order Content */}
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Items List */}
                            <div className="md:col-span-2 space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Items</h4>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center bg-background/50 p-3 rounded-xl">
                                            <div className="h-12 w-12 rounded-lg bg-background overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-bold text-sm line-clamp-1">{item.name}</h5>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                {item.color && (
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-primary mt-1">Color: {item.color}</p>
                                                )}
                                            </div>
                                            <div className="font-bold text-sm">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Admin Response Messages */}
                                {order.cancelAdminResponse && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Cancel Rejected</p>
                                        <p className="text-sm text-muted-foreground">{order.cancelAdminResponse}</p>
                                    </div>
                                )}
                                {order.returnAdminResponse && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Return Rejected</p>
                                        <p className="text-sm text-muted-foreground">{order.returnAdminResponse}</p>
                                    </div>
                                )}
                            </div>

                            {/* Order Summary & Actions */}
                            <div className="space-y-6">
                                {/* Payment Summary */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Payment Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">₹{(order.subtotal || order.total).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Truck className="h-3 w-3" /> Shipping
                                            </span>
                                            {order.shippingAmount === 0 ? (
                                                <span className="font-bold text-green-500 text-xs uppercase">Free</span>
                                            ) : (
                                                <span className="font-medium">₹{order.shippingAmount.toLocaleString()}</span>
                                            )}
                                        </div>
                                        {order.codCharge > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">COD Charge</span>
                                                <span className="font-medium text-amber-500">₹{order.codCharge.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-dashed border-white/10">
                                            <span className="font-bold">Total Paid</span>
                                            <span className="font-black text-primary">₹{(order.grandTotal || order.total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Shipping To</h4>
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <p className="leading-relaxed">{order.shippingAddress}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-6 border-t border-dashed border-white/10 space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-2 font-bold group"
                                        onClick={() => handleTrackOrder(order.id, order.status)}
                                    >
                                        TRACK ORDER <Truck className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    {/* Cancel Button */}
                                    {canCancel(order) && (
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-full border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold"
                                            onClick={() => setCancelModal({ open: true, order })}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> CANCEL ORDER
                                        </Button>
                                    )}

                                    {/* Return Button */}
                                    {canReturn(order) && (
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-full border-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10 font-bold"
                                            onClick={() => setReturnModal({ open: true, order })}
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" /> RETURN ORDER
                                            <span className="ml-2 text-[10px] opacity-70">({getReturnDaysRemaining(order)} days left)</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setCancelModal({ open: false, order: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-secondary/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <XCircle className="h-6 w-6 text-red-500" /> Cancel Order
                                </h2>
                                <button onClick={() => setCancelModal({ open: false, order: null })} className="p-2 hover:bg-secondary/20 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Important
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Your cancel request will be reviewed by admin. You'll be notified once processed.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                                        Reason for Cancellation *
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Please explain why you want to cancel this order..."
                                        className="w-full h-24 bg-secondary/10 border border-secondary/20 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                                    />
                                </div>

                                {/* Refund Details for Online Payment */}
                                {requiresRefund(cancelModal.order) && (
                                    <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Refund Details
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setRefundDetails(d => ({ ...d, refundMethod: 'Bank Transfer' }))}
                                                    className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${refundDetails.refundMethod === 'Bank Transfer' ? 'border-primary bg-primary/10 text-primary' : 'border-secondary/20'}`}
                                                >
                                                    Bank Transfer
                                                </button>
                                                <button
                                                    onClick={() => setRefundDetails(d => ({ ...d, refundMethod: 'UPI' }))}
                                                    className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${refundDetails.refundMethod === 'UPI' ? 'border-primary bg-primary/10 text-primary' : 'border-secondary/20'}`}
                                                >
                                                    UPI
                                                </button>
                                            </div>

                                            {refundDetails.refundMethod === 'Bank Transfer' && (
                                                <>
                                                    <input
                                                        type="text"
                                                        placeholder="Account Holder Name"
                                                        value={refundDetails.accountHolderName}
                                                        onChange={(e) => setRefundDetails(d => ({ ...d, accountHolderName: e.target.value }))}
                                                        className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Bank Name"
                                                        value={refundDetails.bankName}
                                                        onChange={(e) => setRefundDetails(d => ({ ...d, bankName: e.target.value }))}
                                                        className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Account Number"
                                                        value={refundDetails.accountNumber}
                                                        onChange={(e) => setRefundDetails(d => ({ ...d, accountNumber: e.target.value }))}
                                                        className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="IFSC Code"
                                                        value={refundDetails.ifscCode}
                                                        onChange={(e) => setRefundDetails(d => ({ ...d, ifscCode: e.target.value }))}
                                                        className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm"
                                                    />
                                                </>
                                            )}

                                            {refundDetails.refundMethod === 'UPI' && (
                                                <input
                                                    type="text"
                                                    placeholder="UPI ID (e.g., name@paytm)"
                                                    value={refundDetails.upiId}
                                                    onChange={(e) => setRefundDetails(d => ({ ...d, upiId: e.target.value }))}
                                                    className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full h-14 rounded-full font-black uppercase tracking-widest bg-red-500 hover:bg-red-600"
                                    onClick={handleCancelSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Cancel Request'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Return Modal */}
            <AnimatePresence>
                {returnModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setReturnModal({ open: false, order: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-secondary/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <RotateCcw className="h-6 w-6 text-blue-500" /> Return Order
                                </h2>
                                <button onClick={() => setReturnModal({ open: false, order: null })} className="p-2 hover:bg-secondary/20 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Return Window</p>
                                    <p className="text-sm text-muted-foreground">
                                        You have <span className="font-bold text-blue-500">{getReturnDaysRemaining(returnModal.order)} days</span> remaining to request a return.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
                                        Reason for Return *
                                    </label>
                                    <div className="space-y-3">
                                        {['Wrong Product Delivered', 'Defective / Damaged Product'].map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => setReturnReason(reason)}
                                                className={`w-full p-4 rounded-xl border text-left text-sm font-bold transition-all ${returnReason === reason
                                                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                                        : 'border-secondary/20 hover:border-secondary/40'
                                                    }`}
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Refund Details */}
                                <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Banknote className="h-4 w-4" /> Refund Details
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setRefundDetails(d => ({ ...d, refundMethod: 'Bank Transfer' }))}
                                                className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${refundDetails.refundMethod === 'Bank Transfer' ? 'border-primary bg-primary/10 text-primary' : 'border-secondary/20'}`}
                                            >
                                                Bank Transfer
                                            </button>
                                            <button
                                                onClick={() => setRefundDetails(d => ({ ...d, refundMethod: 'UPI' }))}
                                                className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${refundDetails.refundMethod === 'UPI' ? 'border-primary bg-primary/10 text-primary' : 'border-secondary/20'}`}
                                            >
                                                UPI
                                            </button>
                                        </div>

                                        {refundDetails.refundMethod === 'Bank Transfer' && (
                                            <>
                                                <input type="text" placeholder="Account Holder Name" value={refundDetails.accountHolderName} onChange={(e) => setRefundDetails(d => ({ ...d, accountHolderName: e.target.value }))} className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm" />
                                                <input type="text" placeholder="Bank Name" value={refundDetails.bankName} onChange={(e) => setRefundDetails(d => ({ ...d, bankName: e.target.value }))} className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm" />
                                                <input type="text" placeholder="Account Number" value={refundDetails.accountNumber} onChange={(e) => setRefundDetails(d => ({ ...d, accountNumber: e.target.value }))} className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm" />
                                                <input type="text" placeholder="IFSC Code" value={refundDetails.ifscCode} onChange={(e) => setRefundDetails(d => ({ ...d, ifscCode: e.target.value }))} className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm" />
                                            </>
                                        )}

                                        {refundDetails.refundMethod === 'UPI' && (
                                            <input type="text" placeholder="UPI ID (e.g., name@paytm)" value={refundDetails.upiId} onChange={(e) => setRefundDetails(d => ({ ...d, upiId: e.target.value }))} className="w-full bg-background border border-secondary/20 rounded-xl p-3 outline-none text-sm" />
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-full font-black uppercase tracking-widest bg-blue-500 hover:bg-blue-600"
                                    onClick={handleReturnSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Return Request'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
