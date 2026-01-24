import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../lib/axios';

export function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore();
    const [shippingThreshold, setShippingThreshold] = useState(50000);
    const [isGlobalFreeShipping, setIsGlobalFreeShipping] = useState(false);
    
    const totalPrice = getTotalPrice();

    useEffect(() => {
        const fetchShippingThreshold = async () => {
            try {
                const res = await api.get('/shipping/checkout-info');
                if (res.data.success) {
                    setIsGlobalFreeShipping(res.data.freeShippingEnabled);
                    
                    // Find the lowest minAmount that offers free shipping (charge = 0)
                    const freeSlab = res.data.slabs
                        ?.filter(s => s.shippingCharge === 0)
                        ?.sort((a, b) => a.minAmount - b.minAmount)[0];
                    
                    if (freeSlab) {
                        setShippingThreshold(freeSlab.minAmount);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch shipping threshold:', error);
            }
        };

        fetchShippingThreshold();
    }, []);

    const progress = isGlobalFreeShipping ? 100 : Math.min((totalPrice / shippingThreshold) * 100, 100);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                    <AnimatePresence>
                        {getItemCount() > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-2 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-black text-black shadow-glow"
                            >
                                {getItemCount()}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col glass border-l border-border/10 backdrop-blur-2xl">
                <SheetHeader className="pb-8 border-b border-border/10">
                    <SheetTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                        YOUR BAG <ShoppingCart className="h-6 w-6 italic text-primary" />
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-8 space-y-8 scrollbar-hide">
                    {/* Free Shipping Progress */}
                    <div className="px-1 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                            <span>Free Shipping Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary shadow-glow"
                            />
                        </div>
                        <p className="text-[10px] text-primary uppercase font-black tracking-widest text-center italic">
                            {isGlobalFreeShipping
                                ? "You've unlocked FREE SHIPPING!"
                                : totalPrice < shippingThreshold
                                    ? `Spend ₹${(shippingThreshold - totalPrice).toLocaleString()} more for free shipping!`
                                    : "You've unlocked FREE SHIPPING!"}
                        </p>
                    </div>

                    <AnimatePresence initial={false}>
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-4xl shadow-2xl">🛒</div>
                                <div className="space-y-2">
                                    <p className="text-foreground/50 font-black uppercase tracking-[0.2em] text-[10px]">Your bag is currently empty</p>
                                    <Button 
                                        variant="outline" 
                                        className="rounded-full h-12 px-8 font-black italic tracking-tighter"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        CONTINUE EXPLORING
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-6 group relative"
                                    >
                                        <div className="w-24 h-24 bg-secondary/10 rounded-[1.5rem] overflow-hidden flex items-center justify-center p-2 group-hover:bg-secondary/20 transition-colors">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black italic uppercase tracking-tighter text-sm leading-none opacity-90 group-hover:text-primary transition-colors">{item.name}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-destructive hover:text-white transition-all"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50 line-clamp-1">{item.category}</p>
                                            <div className="flex justify-between items-center pt-3">
                                                <div className="flex items-center glass rounded-full px-3 py-1.5 gap-4">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                                                    <span className="text-xs font-black min-w-[12px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                                                </div>
                                                <span className="font-black italic text-lg tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {items.length > 0 && (
                    <div className="pt-8 border-t border-border/10 space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Subtotal</span>
                            <span className="text-3xl font-black italic tracking-tighter text-glow">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground text-center uppercase tracking-[0.2em] font-black opacity-40">Shipping and taxes calculated at checkout</p>
                        <div className="flex gap-4 pb-4">
                            <Button 
                                asChild 
                                variant="outline" 
                                className="flex-1 h-16 rounded-full text-sm font-black italic tracking-tighter border-border/10 hover:bg-foreground hover:text-background"
                                onClick={() => setIsOpen(false)}
                            >
                                <Link to="/cart">VIEW BAG</Link>
                            </Button>
                            <Button 
                                premium 
                                className="flex-[2] h-16 rounded-full text-lg font-black italic tracking-tighter shadow-glow" 
                                asChild
                                onClick={() => setIsOpen(false)}
                            >
                                <Link to="/checkout" className="flex items-center justify-center">
                                    CHECKOUT <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="inline-block ml-3">🏁</motion.span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
