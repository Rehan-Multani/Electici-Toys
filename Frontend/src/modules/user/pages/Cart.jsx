import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../../../lib/axios';

export function Cart() {
    const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
    const { toast } = useToast();
    const [shippingData, setShippingData] = useState({
        freeShippingEnabled: false,
        slabs: []
    });

    const totalPrice = getTotalPrice();

    useEffect(() => {
        const fetchShippingInfo = async () => {
            try {
                const res = await api.get('/shipping/checkout-info');
                if (res.data.success) {
                    setShippingData({
                        freeShippingEnabled: res.data.freeShippingEnabled,
                        slabs: res.data.slabs || []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch shipping info:', error);
            }
        };
        fetchShippingInfo();
    }, []);

    const calculateShippingCharge = () => {
        if (shippingData.freeShippingEnabled) return 0;

        // Find the applicable slab based on totalPrice
        const applicableSlab = shippingData.slabs
            ?.filter(slab => totalPrice >= slab.minAmount && (!slab.maxAmount || totalPrice <= slab.maxAmount))
            ?.sort((a, b) => b.minAmount - a.minAmount)[0];

        return applicableSlab ? applicableSlab.shippingCharge : 0;
    };

    const shippingCharge = calculateShippingCharge();
    const grandTotal = totalPrice + shippingCharge;

    const handleRemove = (id, color, name) => {
        removeItem(id, color);
        toast({
            title: "Removed from Cart",
            description: `${name} has been removed.`,
        });
    };

    return (
        <div className="container mx-auto px-4 py-16 pb-32">
            <div className="flex flex-col gap-12">
                <header>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-primary leading-none mb-4">YOUR BAG</h1>
                    <p className="text-xl font-medium italic text-muted-foreground uppercase">{items.length} Items in your selection</p>
                </header>

                {items.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="text-9xl mb-4">🛒</div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your bag is empty</h2>
                        <p className="text-muted-foreground font-medium italic text-lg">Looks like you haven't added any electric thrills yet.</p>
                        <Button asChild size="lg" className="rounded-full h-14 px-10 font-bold italic tracking-tighter text-xl shadow-xl shadow-primary/20">
                            <Link to="/products">START SHOPPING</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-8">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.color || 'none'}`}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="flex flex-col sm:flex-row gap-8 pb-8 border-b group"
                                    >
                                        <div className="w-full sm:w-48 aspect-square rounded-[2rem] bg-secondary/20 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Link to={`/product/${item.id}`} className="text-2xl font-black tracking-tighter uppercase italic hover:text-primary transition-colors">{item.name}</Link>
                                                    {item.color && <p className="text-xs font-black uppercase text-primary mt-1">Color: {item.color}</p>}
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.category}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemove(item.id, item.color, item.name)}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap justify-between items-end gap-6 mt-8">
                                                <div className="flex items-center bg-secondary/50 rounded-full p-1 border-2 border-transparent focus-within:border-primary transition-all">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-background" onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-10 text-center font-black italic text-lg">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-background" onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <span className="text-3xl font-black italic tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-secondary/20 rounded-[3rem] p-10 sticky top-24 space-y-8">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Order Summary</h3>

                                <div className="space-y-4 text-sm font-bold uppercase tracking-wider">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        {shippingCharge === 0 ? (
                                            <span className="text-emerald-500 font-black">FREE</span>
                                        ) : (
                                            <span>₹{shippingCharge.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 border-t flex justify-between items-end">
                                    <span className="text-lg font-black italic tracking-tighter uppercase">Total</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-primary">₹{grandTotal.toLocaleString()}</span>
                                </div>

                                <Button asChild className="w-full h-16 rounded-full text-xl font-black italic tracking-tighter shadow-xl shadow-primary/20 group">
                                    <Link to="/checkout">
                                        PROCEED TO CHECKOUT <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </Button>

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-primary" /> SECURE CHECKOUT GUARANTEED
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <Truck className="h-4 w-4 text-primary" /> FAST INSURED WORLDWIDE DELIVERY
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
