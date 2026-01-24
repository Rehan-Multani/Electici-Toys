import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function OrderSuccess() {
    useEffect(() => {
        // Fire confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30"
                >
                    <Check className="w-16 h-16 text-white stroke-[4px]" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4"
                >
                    Order Placed!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-muted-foreground mb-12 font-medium"
                >
                    Thank you for your purchase. Your electric toys are getting ready for deployment! 🚀
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link to="/orders">
                        <Button size="lg" className="w-full sm:w-auto h-14 rounded-full font-black italic tracking-wider text-lg">
                            VIEW MY ORDERS
                        </Button>
                    </Link>
                    <Link to="/products">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 rounded-full font-black italic tracking-wider text-lg border-2">
                            CONTINUE SHOPPING
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
