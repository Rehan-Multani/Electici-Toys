import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../user/store/authStore';
import { Button } from '../../user/components/ui/button';
import { Input } from '../../user/components/ui/input';
import { Label } from '../../user/components/ui/label';
import {
    User,
    Store,
    CreditCard,
    Bell,
    Shield,
    ExternalLink,
    Save,
    Camera
} from 'lucide-react';
import { useToast } from '../../user/components/Toast';

export default function Profile() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Profile Updated!",
                description: "Your store settings have been successfully saved."
            });
        }, 1500);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Store Profile</h1>
                <p className="text-muted-foreground font-medium italic">Manage your public identity and account settings</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-8">
                    <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-[2rem] bg-primary/20 flex items-center justify-center p-1 border-2 border-primary/20 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Admin" className="w-full h-full object-cover rounded-3xl" />
                                ) : (
                                    <User className="h-12 w-12 text-primary" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center border-4 border-background hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h3 className="mt-6 text-xl font-black italic uppercase tracking-tighter">{user?.name || 'Admin User'}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Seller Since 2024</p>

                        <div className="w-full h-[1px] bg-secondary/20 my-6" />

                        <div className="grid grid-cols-2 w-full gap-4">
                            <div className="text-center">
                                <p className="text-xs font-black italic">4.9/5</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Rating</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black italic">142</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Orders</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-8 space-y-4">
                        <Button variant="outline" className="w-full rounded-2xl justify-between border-secondary/20 font-bold uppercase tracking-widest text-xs h-12">
                            View Public Store <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full rounded-2xl justify-between border-secondary/20 font-bold uppercase tracking-widest text-xs h-12 text-red-500 hover:bg-red-500/10 hover:border-red-500/20">
                            Delete Account
                        </Button>
                    </div>
                </div>

                {/* Right Column: Detailed Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Business Details */}
                    <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <Store className="h-5 w-5 text-primary" /> Business Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Store Name</Label>
                                <Input defaultValue="Electrici-Toys Official" className="rounded-2xl h-12 bg-background border-secondary/10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Public Email</Label>
                                <Input defaultValue={user?.email || 'admin@example.com'} className="rounded-2xl h-12 bg-background border-secondary/10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Store Bio</Label>
                            <textarea
                                defaultValue="The ultimate destination for electric toys and futuristic gadgets. We provide high-quality hoverboards, scooters, and RC collection."
                                rows={4}
                                className="w-full bg-background border border-secondary/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium italic text-sm"
                            />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-primary" /> Payout Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Bank Name</Label>
                                <Input defaultValue="HDFC Bank" className="rounded-2xl h-12 bg-background border-secondary/10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Account Number</Label>
                                <Input defaultValue="**** **** 4242" className="rounded-2xl h-12 bg-background border-secondary/10" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                            <Shield className="h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">All payment data is encrypted and secure</p>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <Bell className="h-5 w-5 text-primary" /> Notifications
                        </h3>
                        <div className="space-y-4">
                            {[
                                { id: 'new-order', label: 'New Order Alerts', desc: 'Get notified as soon as a toy is sold' },
                                { id: 'low-stock', label: 'Low Stock Warnings', desc: 'Alert when inventory drops below 10 units' },
                                { id: 'reviews', label: 'Customer Reviews', desc: 'Notify when a new rating is posted' },
                            ].map((pref) => (
                                <div key={pref.id} className="flex items-center justify-between p-4 bg-background/50 border border-secondary/10 rounded-2xl">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{pref.label}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium italic">{pref.desc}</p>
                                    </div>
                                    <div className="h-6 w-12 bg-primary rounded-full relative cursor-pointer shadow-inner shadow-black/20">
                                        <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-14 px-12 rounded-full font-black italic tracking-widest uppercase shadow-xl shadow-primary/20"
                        >
                            {isLoading ? 'SAVING...' : <><Save className="mr-2 h-5 w-5" /> Save Changes</>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
