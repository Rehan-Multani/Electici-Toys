import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Truck, CreditCard, Banknote, MapPin, CheckCircle, ArrowRight, Loader2, Package } from 'lucide-react';
import { useToast } from '../components/Toast';

// Load Razorpay Script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export function Checkout() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const addOrder = useOrderStore((state) => state.addOrder);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Shipping state
    const [shippingInfo, setShippingInfo] = useState({
        freeShippingEnabled: false,
        codEnabled: true,
        codCharge: 0,
        slabs: []
    });
    const [loadingShipping, setLoadingShipping] = useState(true);
    const [calculatedShipping, setCalculatedShipping] = useState({
        shippingAmount: 0,
        codCharge: 0,
        grandTotal: 0,
        isFreeShipping: false
    });

    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        paymentMethod: 'cod'
    });

    const [useSavedAddress, setUseSavedAddress] = useState(false);

    const handleSavedAddressToggle = () => {
        const newValue = !useSavedAddress;
        setUseSavedAddress(newValue);
        if (newValue && user) {
            setFormData({
                ...formData,
                fullName: user.fullName || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || ''
            });
        }
    };

    // Fetch shipping info on mount
    useEffect(() => {
        fetchShippingInfo();
    }, []);

    // Recalculate shipping when payment method or cart changes
    useEffect(() => {
        if (!loadingShipping) {
            calculateShipping();
        }
    }, [formData.paymentMethod, items, loadingShipping]);

    const fetchShippingInfo = async () => {
        try {
            const res = await api.get('/shipping/checkout-info');
            if (res.data.success) {
                setShippingInfo({
                    freeShippingEnabled: res.data.freeShippingEnabled,
                    codEnabled: res.data.codEnabled,
                    codCharge: res.data.codCharge,
                    slabs: res.data.slabs || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch shipping info:', error);
        } finally {
            setLoadingShipping(false);
        }
    };

    const calculateShipping = async () => {
        const cartTotal = getTotalPrice();

        try {
            const res = await api.post('/shipping/calculate', {
                cartTotal,
                paymentMethod: formData.paymentMethod === 'cod' ? 'COD' : 'ONLINE'
            });

            if (res.data.success) {
                setCalculatedShipping({
                    shippingAmount: res.data.shippingAmount,
                    codCharge: formData.paymentMethod === 'cod' ? res.data.codCharge : 0,
                    grandTotal: res.data.grandTotal,
                    isFreeShipping: res.data.isFreeShipping
                });
            }
        } catch (error) {
            console.error('Failed to calculate shipping:', error);
            // Fallback to local calculation if API fails
            setCalculatedShipping({
                shippingAmount: 0,
                codCharge: 0,
                grandTotal: cartTotal,
                isFreeShipping: false
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🛒</div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Your Cart is Empty</h2>
                <Button onClick={() => navigate('/products')}>START SHOPPING</Button>
            </div>
        );
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create Shipping Address
            const addressPayload = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                addressLine1: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                zip: formData.zipCode,
                isDefault: true
            };

            const addressResponse = await api.post('/shipping-address', addressPayload);

            if (!addressResponse.data.success) {
                throw new Error("Failed to save address");
            }

            const shippingAddressId = addressResponse.data.address._id;

            // 2. Create Order (backend will calculate shipping)
            const orderPayload = {
                products: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                shippingAddressId: shippingAddressId,
                paymentMethod: formData.paymentMethod === 'cod' ? 'COD' : 'ONLINE'
            };

            const orderResponse = await api.post('/order', orderPayload);

            if (orderResponse.data.success) {
                const orderData = orderResponse.data.order;

                if (formData.paymentMethod === 'card') {
                    // Handle Razorpay Payment
                    const res = await loadRazorpayScript();

                    if (!res) {
                        toast({
                            title: "SDK LOAD ERROR",
                            description: "Razorpay failed to load. Please check your connection.",
                            variant: "destructive",
                        });
                        return;
                    }

                    if (!orderData.orderId) {
                        toast({
                            title: "PAYMENT ERROR",
                            description: "Failed to generate payment ID. Please try again.",
                            variant: "destructive",
                        });
                        return;
                    }

                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_8sYbzHWidwe5Zw',
                        amount: orderData.grandTotal * 100,
                        currency: "INR",
                        name: "Electricity Toys",
                        description: `Order #${orderData.orderId}`,
                        image: "/logo.png",
                        order_id: orderData.orderId,
                        handler: async function (response) {
                            try {
                                const verifyRes = await api.post('/order/verify-payment', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                });

                                if (verifyRes.data.success) {
                                    clearCart();
                                    toast({
                                        title: "PAYMENT SUCCESSFUL! 🎉",
                                        description: "Your order has been confirmed.",
                                    });
                                    navigate('/order-success');
                                }
                            } catch (err) {
                                toast({
                                    title: "VERIFICATION FAILED",
                                    description: "Payment was successful but verification failed. Please contact support.",
                                    variant: "destructive",
                                });
                            }
                        },
                        prefill: {
                            name: formData.fullName,
                            email: formData.email,
                            contact: formData.phone,
                        },
                        theme: {
                            color: "#ff6b00",
                        },
                    };

                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();
                } else {
                    // COD Success
                    clearCart();
                    toast({
                        title: "ORDER PLACED! 🎉",
                        description: "Your order has been placed successfully.",
                    });
                    navigate('/order-success');
                }
            } else {
                throw new Error(orderResponse.data.message || "Failed to place order");
            }

        } catch (error) {
            console.error("Checkout Error:", error);
            toast({
                title: "ORDER FAILED",
                description: error.response?.data?.message || error.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const subtotal = getTotalPrice();
    const shippingAmount = calculatedShipping.shippingAmount;
    const codCharge = calculatedShipping.codCharge;
    const grandTotal = subtotal + shippingAmount + codCharge;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-6 text-foreground">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping & Payment - Left Side (occupies 2 cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Shipping Details */}
                    <div className="bg-card/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-black italic tracking-tight uppercase text-foreground">Shipping Details</h2>
                            </div>

                            {user && (
                                <button
                                    type="button"
                                    onClick={handleSavedAddressToggle}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                        useSavedAddress 
                                        ? 'bg-primary/10 border-primary/50 text-primary' 
                                        : 'bg-secondary/5 border-border/50 text-muted-foreground hover:bg-secondary/10'
                                    }`}
                                >
                                    {useSavedAddress ? (
                                        <>
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            Using Profile Details
                                        </>
                                    ) : (
                                        <>
                                            <Package className="h-3.5 w-3.5" />
                                            Use Profile Details
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <input
                                    required
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            setFormData({ ...formData, phone: val });
                                        }
                                    }}
                                    className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                    placeholder="10-digit number"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Address</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50 resize-none"
                                    placeholder="House No, Street Name, Area, Landmark"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">State</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                        placeholder="State"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Zip Code</label>
                                    <input
                                        required
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 6) {
                                                setFormData({ ...formData, zipCode: val });
                                            }
                                        }}
                                        className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                        placeholder="6-digit pincode"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-card/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-black italic tracking-tight uppercase text-foreground">Payment Method</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                className={`cursor-pointer border rounded-2xl p-4 flex items-center gap-3 transition-all relative overflow-hidden ${formData.paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border bg-background/50 hover:bg-muted/50'}`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${formData.paymentMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-foreground">Card / UPI</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Fast & Secure</p>
                                </div>
                                {formData.paymentMethod === 'card' && <CheckCircle className="ml-auto text-primary h-5 w-5" />}
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                className={`cursor-pointer border rounded-2xl p-4 flex items-center gap-3 transition-all relative overflow-hidden ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border bg-background/50 hover:bg-muted/50'}`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${formData.paymentMethod === 'cod' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                    <Banknote className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-foreground">Cash on Delivery</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        Pay at doorstep
                                        {shippingInfo.codEnabled && shippingInfo.codCharge > 0 && !calculatedShipping.isFreeShipping && (
                                            <span className="ml-1 text-amber-500">+₹{shippingInfo.codCharge}</span>
                                        )}
                                    </p>
                                </div>
                                {formData.paymentMethod === 'cod' && <CheckCircle className="ml-auto text-primary h-5 w-5" />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Order Summary - Right Side (occupies 1 col) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-lg sticky top-24">
                        <h2 className="text-xl font-black italic tracking-tight uppercase mb-6 text-foreground">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 items-center group">
                                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold uppercase text-xs line-clamp-1 text-foreground">{item.name}</h4>
                                        <p className="text-[10px] text-muted-foreground font-medium">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-bold text-sm text-foreground">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border">
                            {/* Subtotal */}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold text-foreground">₹{subtotal.toLocaleString()}</span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium flex items-center gap-1">
                                    <Truck className="h-3 w-3" /> Shipping
                                </span>
                                {loadingShipping ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : calculatedShipping.isFreeShipping || shippingAmount === 0 ? (
                                    <span className="font-black text-xs uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Free</span>
                                ) : (
                                    <span className="font-bold text-foreground">₹{shippingAmount.toLocaleString()}</span>
                                )}
                            </div>

                            {/* COD Charge - Only show if applicable */}
                            <AnimatePresence>
                                {formData.paymentMethod === 'cod' && codCharge > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                                            <Banknote className="h-3 w-3" /> COD Charge
                                        </span>
                                        <span className="font-bold text-amber-500">₹{codCharge.toLocaleString()}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Total */}
                            <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-border">
                                <span className="text-base font-bold text-foreground">Total</span>
                                <span className="text-2xl font-black italic tracking-tighter text-primary">
                                    ₹{grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            className="w-full h-12 mt-6 rounded-full text-sm font-black italic tracking-widest uppercase shadow-lg shadow-primary/20 group hover:scale-[1.02] transition-all"
                            disabled={isLoading || loadingShipping}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">PROCESSING...</span>
                            ) : (
                                <span className="flex items-center justify-center">CONFIRM ORDER <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 justify-center mt-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                            <Truck className="h-3 w-3" /> Secure SSL Checkout
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
