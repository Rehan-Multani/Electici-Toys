import React from 'react';
import { motion } from 'framer-motion';
import { useOrderStore } from '../store/orderStore';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, ArrowRight, ShoppingBag, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';

export function MyOrders() {
    const { orders, fetchOrders } = useOrderStore();
    const { toast } = useToast();

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleTrackOrder = (orderId, status) => {
        const statusMessages = {
            'pending': "We've received your order and it's awaiting confirmation.",
            'processing': "Your electric toys are being packed and prepared for deployment!",
            'shipped': "Your order is on the way! It has been handed over to our delivery partner.",
            'delivered': "Order delivered! Hope you enjoy your new electric toys! 🚀",
            'cancelled': "This order has been cancelled."
        };

        const message = statusMessages[status.toLowerCase()] || `Order is currently ${status.toUpperCase()}.`;

        toast({
            title: "ORDER TRACKING",
            description: message,
            variant: "default",
        });
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
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black tracking-tight">{order.orderId || order.id}</h3>
                                    <Badge variant="outline" className="border-primary/50 text-foreground bg-primary/10">
                                        {order.status}
                                    </Badge>
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
                                            </div>
                                            <div className="font-bold text-sm">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary & Shipping Info */}
                            <div className="space-y-6">
                                {/* Order Breakdown */}
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
                                            {order.shippingAmount === 0 || order.shippingAmount === undefined ? (
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

                                <div className="pt-6 border-t border-dashed border-white/10">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-2 font-bold group"
                                        onClick={() => handleTrackOrder(order.id, order.status)}
                                    >
                                        TRACK ORDER <Truck className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
