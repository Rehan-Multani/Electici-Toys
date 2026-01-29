import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminOrderStore } from '../../store/adminOrderStore';
import { Button } from '../../../user/components/ui/button';
import { Badge } from '../../../user/components/ui/badge';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { useToast } from '../../../user/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Package,
    CreditCard,
    MapPin,
    Calendar,
    Phone,
    CheckCircle,
    Clock,
    AlertCircle,
    Printer,
    XCircle,
    RotateCcw,
    Banknote,
    X,
    Check,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        getOrderById,
        updateOrderStatus,
        approveCancel,
        rejectCancel,
        approveReturn,
        rejectReturn,
        completeRefund,
        loading
    } = useAdminOrderStore();
    const order = getOrderById(id);
    const invoiceRef = useRef();

    // Modal states
    const [rejectModal, setRejectModal] = useState({ open: false, type: null }); // type: 'cancel' or 'return'
    const [rejectReason, setRejectReason] = useState('');
    const [refundModal, setRefundModal] = useState(false);
    const [refundTransactionId, setRefundTransactionId] = useState('');

    const handleDownloadInvoice = async () => {
        const element = invoiceRef.current;
        if (!element) {
            toast({
                title: "Error",
                description: "Invoice template not found.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Generating Invoice",
            description: "Please wait while your PDF is being prepared...",
        });

        try {
            const opt = {
                margin: [15, 10], // Increased top margin, 10mm side margins
                filename: `Invoice_${order.displayId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#FFFFFF',
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();

            toast({
                title: "Success",
                description: "Invoice downloaded successfully!",
                variant: "success"
            });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast({
                title: "Download Failed",
                description: "There was an error generating your PDF. Please try again.",
                variant: "destructive"
            });
        }
    };

    if (!order) {
        return (
            <div className="p-8 text-center py-20">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Order not found</h2>
                <Button onClick={() => navigate('/admin/orders')} className="mt-4">Back to Orders</Button>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="h-6 w-6 text-amber-500" />;
            case 'Processing': return <AlertCircle className="h-6 w-6 text-blue-500" />;
            case 'Shipped': return <Truck className="h-6 w-6 text-primary" />;
            case 'Delivered': return <CheckCircle className="h-6 w-6 text-emerald-500" />;
            default: return null;
        }
    };

    const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentStepIndex = statusSteps.indexOf(order.status);
    const isOnlinePayment = ['RAZORPAY', 'CARD', 'ONLINE', 'RAZORPAY_PAYMENT'].includes(order.paymentMethod?.toUpperCase());

    // Cancel/Return action handlers
    const handleApproveCancel = async () => {
        const result = await approveCancel(order.id);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "success" : "destructive"
        });
    };

    const handleApproveReturn = async () => {
        const result = await approveReturn(order.id);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "success" : "destructive"
        });
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast({ title: "Error", description: "Please enter a reason", variant: "destructive" });
            return;
        }
        const action = rejectModal.type === 'cancel' ? rejectCancel : rejectReturn;
        const result = await action(order.id, rejectReason);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "success" : "destructive"
        });
        setRejectModal({ open: false, type: null });
        setRejectReason('');
    };

    const handleCompleteRefund = async () => {
        const result = await completeRefund(order.id, refundTransactionId);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "success" : "destructive"
        });
        setRefundModal(false);
        setRefundTransactionId('');
    };

    // Check if order has pending cancel/return request
    const hasPendingCancel = order.cancelRequestedAt && order.cancelApprovedByAdmin === null;
    const hasPendingReturn = order.returnRequestedAt && order.returnApprovedByAdmin === null;
    const hasPendingRefund = order.refundStatus === 'Processing';

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Order {order.displayId}</h1>
                            <Badge variant="success" className="bg-primary/20 text-primary border-primary/20 font-black italic uppercase tracking-widest text-[10px]">
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground font-medium italic">Placed on {format(new Date(order.date), 'MMMM dd, yyyy • hh:mm a')}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleDownloadInvoice}
                        className="rounded-full font-bold uppercase tracking-widest text-xs border-secondary/20"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Print Invoice
                    </Button>
                    <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-xs px-6 py-3 rounded-full outline-none cursor-pointer shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {statusSteps.map(step => (
                            <option key={step} value={step}>MARK AS {step}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Order Stepper */}
            <div className="bg-secondary/10 p-12 rounded-[2.5rem] border border-secondary/20">
                <div className="relative flex justify-between">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary/20 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000"
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />

                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isActive = index === currentStepIndex;

                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30' : 'bg-background border-2 border-secondary/20 text-muted-foreground'
                                    }`}>
                                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <Package className="h-5 w-5 text-primary" /> Order Items
                        </h3>
                        <div className="space-y-6">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex gap-6 items-center">
                                    <div className="h-20 w-20 bg-background rounded-2xl border border-secondary/20 flex-shrink-0 overflow-hidden relative">
                                        {item.image ? (
                                            <>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-secondary/5 z-0">
                                                    <Package className="h-8 w-8 text-secondary/30" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                                                <Package className="h-8 w-8 text-secondary/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold uppercase italic tracking-tight text-lg">{item.name}</h4>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                        {item.color && <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Color: {item.color}</p>}
                                    </div>
                                    <div className="text-xl font-black italic tracking-tighter">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-dashed border-secondary/20 space-y-3">
                            <div className="flex justify-between text-sm uppercase tracking-widest font-bold text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{(order.totalAmount || order.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm uppercase tracking-widest font-bold">
                                <span className="text-muted-foreground">Shipping</span>
                                {order.shippingAmount === 0 || order.shippingAmount === undefined ? (
                                    <span className="text-green-500">FREE</span>
                                ) : (
                                    <span>₹{(order.shippingAmount || 0).toLocaleString()}</span>
                                )}
                            </div>
                            {order.codCharge > 0 && (
                                <div className="flex justify-between text-sm uppercase tracking-widest font-bold">
                                    <span className="text-muted-foreground">COD Charge</span>
                                    <span className="text-amber-500">₹{order.codCharge.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-black italic tracking-tighter pt-4 border-t border-secondary/20">
                                <span>Grand Total</span>
                                <span className="text-primary">₹{(order.grandTotal || order.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="space-y-8">
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" /> Delivery Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-background rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected</p>
                                    <p className="font-bold uppercase tracking-tight italic">Jan 15, 2026</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Customer</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center font-black italic text-primary">
                                            {order.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold uppercase tracking-tight italic">{order.customer}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">{order.email}</p>
                                            <p className="text-[10px] text-primary font-black italic mt-1 flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {order.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shipping Address</p>
                                    <div className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                                        {order.shippingAddress ? (
                                            <>
                                                <p>{order.shippingAddress.addressLine1}</p>
                                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                                <p>{order.shippingAddress.country}</p>
                                            </>
                                        ) : (
                                            <p>{order.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-primary" /> Payment
                        </h3>
                        <div className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-secondary/10">
                            <div className="flex items-center gap-3">
                                {isOnlinePayment ? <CreditCard className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                                <span className="font-bold uppercase tracking-widest text-xs">
                                    {isOnlinePayment ? 'Online Payment' : 'Cash on Delivery'}
                                </span>
                            </div>
                            <Badge variant="success" className="text-[8px] uppercase tracking-widest">
                                {isOnlinePayment ? 'PAID' : 'PENDING'}
                            </Badge>
                        </div>
                    </div>

                    <a href={`tel:${order.phone}`} className="block w-full">
                        <Button className="w-full h-14 rounded-full font-black italic tracking-widest uppercase shadow-xl shadow-primary/10">
                            Contact Customer
                        </Button>
                    </a>
                </div>
            </div>

            {/* Hidden Invoice Template - using display block/height 0 and inline colors to avoid oklch errors */}
            <div
                style={{
                    display: 'block',
                    height: 0,
                    overflow: 'hidden',
                    position: 'absolute',
                    zIndex: -1
                }}
            >
                <div ref={invoiceRef} style={{ width: '190mm', padding: '20px', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '32px', marginBottom: '32px', borderBottom: '2px solid #D97706' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#D97706' }}>ELECTRYCITY</h1>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Premium Electric Toys Store</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.025em', color: '#111827' }}>INVOICE</h2>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '14px', color: '#111827' }}>#{order.displayId}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>{format(new Date(order.date), 'MMMM dd, yyyy')}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D97706' }}>Bill To:</h3>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '18px', lineHeight: '1.2', textTransform: 'uppercase', fontStyle: 'italic', color: '#111827' }}>{order.customer}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '500', fontStyle: 'italic', color: '#6B7280' }}>{order.email}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '900', fontStyle: 'italic', color: '#D97706' }}>{order.phone}</p>
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D97706' }}>Shipping Address:</h3>
                            <div style={{ fontSize: '14px', fontWeight: '500', fontStyle: 'italic', lineHeight: '1.625', color: '#6B7280' }}>
                                {order.shippingAddress ? (
                                    <>
                                        <p style={{ margin: 0 }}>{order.shippingAddress.addressLine1}</p>
                                        {order.shippingAddress.addressLine2 && <p style={{ margin: 0 }}>{order.shippingAddress.addressLine2}</p>}
                                        <p style={{ margin: 0 }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                        <p style={{ margin: 0 }}>{order.shippingAddress.country}</p>
                                    </>
                                ) : (
                                    <p style={{ margin: 0 }}>{order.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', marginBottom: '40px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Item Description</th>
                                <th style={{ textAlign: 'center', padding: '16px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Price</th>
                                <th style={{ textAlign: 'center', padding: '16px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '16px 0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '16px 0' }}>
                                        <p style={{ margin: 0, fontWeight: '700', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.025em', color: '#111827' }}>{item.name}</p>
                                        {item.color && <p style={{ margin: '4px 0 0 0', fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>COLOR: {item.color}</p>}
                                    </td>
                                    <td style={{ padding: '16px 0', textAlign: 'center', fontWeight: '700', color: '#111827' }}>₹{item.price.toLocaleString()}</td>
                                    <td style={{ padding: '16px 0', textAlign: 'center', fontWeight: '700', color: '#111827' }}>{item.quantity}</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '900', fontStyle: 'italic', color: '#111827' }}>₹{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '256px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280' }}>Payment Method:</span>
                                <span style={{ color: '#D97706' }}>{isOnlinePayment ? 'Online Payment' : 'Cash on Delivery'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', color: '#6B7280' }}>
                                <span>Subtotal</span>
                                <span style={{ color: '#111827' }}>₹{(order.totalAmount || order.total || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                                <span style={{ color: '#6B7280' }}>Shipping</span>
                                {order.shippingAmount === 0 || order.shippingAmount === undefined ? (
                                    <span style={{ color: '#10B981' }}>FREE</span>
                                ) : (
                                    <span style={{ color: '#111827' }}>₹{(order.shippingAmount || 0).toLocaleString()}</span>
                                )}
                            </div>
                            {order.codCharge > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    <span style={{ color: '#6B7280' }}>COD Charge</span>
                                    <span style={{ color: '#111827' }}>₹{order.codCharge.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', paddingTop: '16px', borderTop: '2px solid #D97706', color: '#D97706' }}>
                                <span>Grand Total</span>
                                <span>₹{(order.grandTotal || order.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '80px', paddingTop: '40px', textAlign: 'center', borderTop: '1px dashed #E5E7EB' }}>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>Thank you for shopping with Electrycity!</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '8px', fontWeight: '700', color: '#6B7280' }}>This is a computer generated invoice and does not require a signature.</p>
                    </div>
                </div>
            </div>

            {/* Cancel/Return Request Actions */}
            {(hasPendingCancel || hasPendingReturn || hasPendingRefund) && (
                <div className="space-y-6">
                    {/* Pending Cancel Request */}
                    {hasPendingCancel && (
                        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-[2rem] p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-12 w-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Cancel Request Pending</h3>
                                    <p className="text-sm text-muted-foreground mt-1">User requested to cancel this order</p>
                                </div>
                            </div>

                            <div className="bg-background/50 rounded-xl p-4 mb-6">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Cancel Reason</p>
                                <p className="text-sm font-medium">{order.cancelReason || 'No reason provided'}</p>
                                <p className="text-xs text-muted-foreground mt-2">Requested: {order.cancelRequestedAt ? format(new Date(order.cancelRequestedAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
                            </div>

                            {order.refundDetails && (
                                <div className="bg-background/50 rounded-xl p-4 mb-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Refund Details</p>
                                    <p className="text-sm">Method: {order.refundDetails.refundMethod}</p>
                                    {order.refundDetails.refundMethod === 'Bank Transfer' && (
                                        <>
                                            <p className="text-sm">Account: {order.refundDetails.accountHolderName}</p>
                                            <p className="text-sm">Bank: {order.refundDetails.bankName} | A/C: {order.refundDetails.accountNumber}</p>
                                            <p className="text-sm">IFSC: {order.refundDetails.ifscCode}</p>
                                        </>
                                    )}
                                    {order.refundDetails.refundMethod === 'UPI' && (
                                        <p className="text-sm">UPI ID: {order.refundDetails.upiId}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleApproveCancel}
                                    disabled={loading}
                                    className="flex-1 h-12 rounded-full bg-green-500 hover:bg-green-600 font-black uppercase tracking-widest"
                                >
                                    <Check className="mr-2 h-4 w-4" /> Approve Cancel
                                </Button>
                                <Button
                                    onClick={() => setRejectModal({ open: true, type: 'cancel' })}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-full border-red-500 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest"
                                >
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pending Return Request */}
                    {hasPendingReturn && (
                        <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-[2rem] p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-12 w-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <RotateCcw className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">Return Request Pending</h3>
                                    <p className="text-sm text-muted-foreground mt-1">User requested to return this order</p>
                                </div>
                            </div>

                            <div className="bg-background/50 rounded-xl p-4 mb-6">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Return Reason</p>
                                <p className="text-sm font-medium">{order.returnReason || 'No reason provided'}</p>
                                <p className="text-xs text-muted-foreground mt-2">Requested: {order.returnRequestedAt ? format(new Date(order.returnRequestedAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleApproveReturn}
                                    disabled={loading}
                                    className="flex-1 h-12 rounded-full bg-green-500 hover:bg-green-600 font-black uppercase tracking-widest"
                                >
                                    <Check className="mr-2 h-4 w-4" /> Approve Return
                                </Button>
                                <Button
                                    onClick={() => setRejectModal({ open: true, type: 'return' })}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-full border-purple-500 text-purple-500 hover:bg-purple-500/10 font-black uppercase tracking-widest"
                                >
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pending Refund */}
                    {hasPendingRefund && (
                        <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-[2rem] p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-12 w-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                                    <Banknote className="h-6 w-6 text-cyan-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-cyan-500">Refund Processing</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Refund of ₹{order.refundAmount?.toLocaleString()} is pending</p>
                                </div>
                            </div>

                            {order.refundDetails && (
                                <div className="bg-background/50 rounded-xl p-4 mb-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Refund To</p>
                                    <p className="text-sm">Method: {order.refundDetails.refundMethod}</p>
                                    {order.refundDetails.refundMethod === 'Bank Transfer' && (
                                        <>
                                            <p className="text-sm">Account: {order.refundDetails.accountHolderName}</p>
                                            <p className="text-sm">Bank: {order.refundDetails.bankName} | A/C: {order.refundDetails.accountNumber}</p>
                                            <p className="text-sm">IFSC: {order.refundDetails.ifscCode}</p>
                                        </>
                                    )}
                                    {order.refundDetails.refundMethod === 'UPI' && (
                                        <p className="text-sm">UPI ID: {order.refundDetails.upiId}</p>
                                    )}
                                </div>
                            )}

                            <Button
                                onClick={() => setRefundModal(true)}
                                className="w-full h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 font-black uppercase tracking-widest"
                            >
                                <Check className="mr-2 h-4 w-4" /> Mark Refund Complete
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setRejectModal({ open: false, type: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-secondary/20 rounded-3xl p-8 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Reject {rejectModal.type === 'cancel' ? 'Cancel' : 'Return'} Request
                                </h2>
                                <button onClick={() => setRejectModal({ open: false, type: null })} className="p-2 hover:bg-secondary/20 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Rejection Reason *</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        className="w-full h-24 bg-secondary/10 border border-secondary/20 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                                    />
                                </div>

                                <Button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="w-full h-12 rounded-full bg-red-500 hover:bg-red-600 font-black uppercase tracking-widest"
                                >
                                    {loading ? 'Processing...' : 'Confirm Rejection'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Refund Complete Modal */}
            <AnimatePresence>
                {refundModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setRefundModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-secondary/20 rounded-3xl p-8 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <Banknote className="h-5 w-5 text-cyan-500" /> Complete Refund
                                </h2>
                                <button onClick={() => setRefundModal(false)} className="p-2 hover:bg-secondary/20 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-cyan-500/10 rounded-xl">
                                    <p className="text-lg font-black text-cyan-500">₹{order.refundAmount?.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Refund Amount</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Transaction ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={refundTransactionId}
                                        onChange={(e) => setRefundTransactionId(e.target.value)}
                                        placeholder="Enter refund transaction ID..."
                                        className="w-full bg-secondary/10 border border-secondary/20 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    />
                                </div>

                                <Button
                                    onClick={handleCompleteRefund}
                                    disabled={loading}
                                    className="w-full h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 font-black uppercase tracking-widest"
                                >
                                    {loading ? 'Processing...' : 'Mark as Completed'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

