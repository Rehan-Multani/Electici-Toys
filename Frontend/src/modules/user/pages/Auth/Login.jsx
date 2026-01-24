import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';

export function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast({
                    title: "WELCOME BACK!",
                    description: "Login successful.",
                });
                navigate('/home');
            } else {
                toast({
                    title: "LOGIN FAILED",
                    description: result.error || "An error occurred during login",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "LOGIN ERROR",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-background transition-colors duration-300 overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 lg:p-16 justify-start pt-28 h-full">
                <div className="max-w-md w-full mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter text-primary mb-2">ELECTRICI TOYS-HUB</h2>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">Login to your account</h1>
                        <p className="text-base text-muted-foreground">Welcome back! Select a method to log in:</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-14 px-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-14 px-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all pr-12 text-base"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-border flex items-center justify-center transition-colors group-hover:border-primary">
                                    <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100" />
                                </div>
                                <span className="text-sm text-muted-foreground select-none group-hover:text-foreground">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-foreground hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block w-1/2 p-12">
                <div className="w-full h-full rounded-tl-[100px] rounded-br-[100px] rounded-tr-[30px] rounded-bl-[30px] relative overflow-hidden">
                    <img
                        src="/assets/products/WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg"
                        alt="Login Feature"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Discovering the Best<br />Toys for Your Kids
                        </h2>
                        <p className="text-gray-300 text-lg mb-10 max-w-lg">
                            Our practice is Designing Complete Environments exceptional buildings communities and place in special situations.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold">
                                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">✓</span>
                                100% Fun Guaranteed
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold">
                                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">🚚</span>
                                Free Delivery
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
