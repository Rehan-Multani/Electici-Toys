import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';

export function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Get email from navigation state or empty string
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const verifyOtp = useAuthStore((state) => state.verifyOtp);

    useEffect(() => {
        // If no email provided, maybe user should not be here, but we'll let them enter it.
        // Or we could redirect to login if we want to be strict.
        if (!email && !location.state?.email) {
            toast({
                title: "Information Missing",
                description: "Please enter your email to verify OTP.",
                variant: "default",
            });
        }
    }, [email, location.state, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp) {
            toast({
                title: "Missing Fields",
                description: "Please enter both Email and OTP.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyOtp(email, otp);

            if (result.success) {
                toast({
                    title: "VERIFICATION SUCCESSFUL! 🎉",
                    description: "Your account is now active.",
                    variant: "default",
                });
                navigate('/home');
            } else {
                toast({
                    title: "VERIFICATION FAILED",
                    description: result.error || "Invalid OTP or Email",
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
        <div className="h-screen w-full flex bg-background transition-colors duration-300 overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 lg:p-16 justify-start pt-28 h-full">
                <div className="max-w-md w-full mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter text-primary mb-2">ELECTRICI TOYS-HUB</h2>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">Verify your account</h1>
                        <p className="text-base text-muted-foreground">We sent a verification code to your email.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 px-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">OTP Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full h-14 px-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base tracking-widest"
                                placeholder="Enter 6-digit OTP"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Didn't receive code?{' '}
                        <button className="font-bold text-foreground hover:underline">
                            Resend
                        </button>
                    </p>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                        <Link to="/login" className="text-primary hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block w-1/2 p-12">
                <div className="w-full h-full rounded-tl-[100px] rounded-br-[100px] rounded-tr-[30px] rounded-bl-[30px] relative overflow-hidden">
                    <img
                        src="/assets/products/WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg"
                        alt="Security Feature"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Secure & Safe<br />Shopping Experience
                        </h2>
                        <p className="text-gray-300 text-lg mb-10 max-w-lg">
                            We prioritize your security and ensure your account is safe with us.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
