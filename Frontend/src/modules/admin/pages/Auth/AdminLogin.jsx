import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { useToast } from '../../../user/components/Toast';
import { Loader2, ArrowRight, Store } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAdminAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Calling login but it essentially acts as "Enter Hub" (auto-register if new)
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast({
                    title: "Welcome, Partner!",
                    description: "Access granted to admin hub.",
                    variant: "success",
                });
                navigate('/admin');
            } else {
                toast({
                    title: "Access Denied",
                    description: result.error || "Unable to access hub",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex text-foreground relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-6xl mx-auto flex items-center justify-center p-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

                    {/* Left Side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-background/60 backdrop-blur-xl border border-secondary/20 p-8 md:p-10 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="mb-8">
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Partner Access</h1>
                            <p className="text-muted-foreground font-medium italic">Login or auto-create your store admin account.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">



                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest pl-4">Business Email</label>
                                <Input
                                    type="email"
                                    placeholder="store@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 rounded-2xl bg-secondary/10 border-secondary/20 focus:border-primary/50 text-sm font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest pl-4">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-12 rounded-2xl bg-secondary/10 border-secondary/20 focus:border-primary/50 text-sm font-bold"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-widest hover:scale-[1.02] transition-transform bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Accessing Hub...
                                    </>
                                ) : (
                                    <>
                                        Enter Hub <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <div className="w-full h-[1px] bg-secondary/20" />
                            <Link to="/login" className="inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                                Go to Customer Login
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Side - Brand/Hero */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="hidden lg:block text-right space-y-8"
                    >
                        <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-primary/10 mb-4 border border-primary/20">
                            <Store className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-tight">
                            Grow Your<br />
                            <span className="text-primary">Toy Empire</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium max-w-md ml-auto">
                            Join the team managing the coolest electric toys on the planet. Manage inventory, track sales, and scale up.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mt-12 pl-20">
                            <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20 backdrop-blur-sm">
                                <h3 className="text-2xl font-black text-primary">₹50L+</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Monthly Payouts</p>
                            </div>
                            <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20 backdrop-blur-sm">
                                <h3 className="text-2xl font-black text-primary">24/7</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Admin Support</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
