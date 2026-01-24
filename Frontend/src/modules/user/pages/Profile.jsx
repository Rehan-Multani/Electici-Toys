import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    ShoppingBag,
    Heart,
    Settings,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useToast } from '../components/Toast';

export function Profile() {
    const { user, updateProfile } = useAuthStore();
    const { orders, fetchOrders } = useOrderStore();
    const { items: wishlistItems, fetchWishlist } = useWishlistStore();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        zipCode: user?.zipCode || ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.fullName || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || ''
            });
            fetchOrders();
            fetchWishlist();
        }
    }, [user, fetchOrders, fetchWishlist]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const res = await updateProfile(formData);
            if (res.success) {
                toast({
                    title: "PROFILE UPDATED! 🎉",
                    description: "Your personal details have been successfully saved.",
                });
            } else {
                toast({
                    title: "UPDATE FAILED",
                    description: res.error || "Failed to update profile.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "ERROR",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-background">
            <div className="container mx-auto px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                >
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-2 text-foreground">Account Settings</h1>
                            <p className="text-muted-foreground font-medium italic">Manage your profile information and preferences</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Sidebar: Profile Summary */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-card/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50 shadow-sm flex flex-col items-center text-center">
                                <div className="relative group">
                                    <div className="h-40 w-40 rounded-[2.5rem] bg-primary/10 flex items-center justify-center p-1.5 border-2 border-primary/20 overflow-hidden group-hover:border-primary/50 transition-all duration-500">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[2.3rem]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/10 rounded-[2.3rem]">
                                                <User className="h-16 w-16 text-primary/30" />
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="button"
                                        className="absolute bottom-1 right-1 h-10 w-10 bg-primary text-black rounded-2xl flex items-center justify-center border-4 border-background hover:scale-110 transition-all duration-300 shadow-lg"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                <div className="mt-6 space-y-1">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">{user?.fullName || user?.name}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.email}</p>
                                </div>

                                <div className="w-full h-[1px] bg-border/50 my-6" />

                                <div className="grid grid-cols-2 w-full gap-4">
                                    <button 
                                        onClick={() => navigate('/orders')}
                                        className="p-4 rounded-3xl bg-secondary/5 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group"
                                    >
                                        <ShoppingBag className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xl font-black italic text-foreground leading-none">{orders.length}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders</p>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/wishlist')}
                                        className="p-4 rounded-3xl bg-secondary/5 border border-border/50 hover:bg-pink-500/5 hover:border-pink-500/20 transition-all duration-300 group"
                                    >
                                        <Heart className="h-5 w-5 text-pink-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xl font-black italic text-foreground leading-none">{wishlistItems.length}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Wishlist</p>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats/Links */}
                            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-4 space-y-2">
                                <button 
                                    onClick={() => navigate('/orders')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <ShoppingBag className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold italic uppercase tracking-tighter text-xs">Order History</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </button>
                                <button 
                                    onClick={() => navigate('/wishlist')}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                                            <Heart className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold italic uppercase tracking-tighter text-xs">My Wishlist</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Right Content: Profile Form */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Settings className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Account Information</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium italic uppercase tracking-wider">Update your personal and shipping details</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                        {/* Name Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                            <input 
                                                required
                                                maxLength={50}
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        {/* Email Field (Read Only) */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                            <input 
                                                readOnly
                                                type="email"
                                                value={formData.email}
                                                className="w-full h-11 bg-secondary/10 border border-input rounded-xl px-4 font-medium text-sm text-muted-foreground cursor-not-allowed"
                                                placeholder="Email cannot be changed"
                                            />
                                        </div>

                                        {/* Phone Field */}
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

                                        {/* Zip Code Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Zip / Postal Code</label>
                                            <input 
                                                required
                                                maxLength={6}
                                                pattern="[0-9]{6}"
                                                type="text"
                                                value={formData.zipCode}
                                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                                placeholder="6-digit pincode"
                                            />
                                        </div>

                                        {/* Address Field (Full Width) */}
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Address</label>
                                            <textarea 
                                                required
                                                maxLength={200}
                                                rows={3}
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50 resize-none"
                                                placeholder="House No, Street Name, Area, Landmark"
                                            />
                                        </div>

                                        {/* City Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City</label>
                                            <input 
                                                required
                                                maxLength={50}
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                                placeholder="e.g. Mumbai"
                                            />
                                        </div>

                                        {/* State Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">State</label>
                                            <input 
                                                required
                                                maxLength={50}
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full h-11 bg-background/50 border border-input rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm placeholder:text-muted-foreground/50"
                                                placeholder="e.g. Maharashtra"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            premium
                                            className="h-12 px-10 rounded-xl font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    SAVING...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Save className="h-5 w-5" />
                                                    SAVE CHANGES
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

