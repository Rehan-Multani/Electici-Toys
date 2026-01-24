import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from "@/lib/utils";

// ... imports remain same
// ... imports remain same
// ... imports remain same
import { useContentStore } from '../../admin/store/adminContentStore';

// Vibrant Card Colors removed - using static light theme

export function Testimonials() {
    const { content } = useContentStore();
    const reviews = content.homePage?.testimonials || content.testimonials || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    if (!reviews || reviews.length === 0) return null;

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(reviews.length / 2));
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + Math.ceil(reviews.length / 2)) % Math.ceil(reviews.length / 2));
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    const visibleReviews = [
        reviews[currentIndex * 2 % reviews.length],
        reviews[(currentIndex * 2 + 1) % reviews.length]
    ].filter(Boolean);

    return (
        <section className="w-full py-16 relative overflow-hidden bg-secondary/30 dark:bg-card/20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 space-y-4"
                >
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground drop-shadow-sm font-['Oswald']">
                        Trusted by Thousands of Customers Like You
                    </h2>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-glow" />
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="overflow-hidden px-4 md:px-12">
                        <AnimatePresence mode='wait' custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16"
                            >
                                {visibleReviews.map((review) => (
                                    <div key={review.id} className="flex flex-col items-center text-center space-y-5 group">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full p-1.5 bg-card border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-500">
                                                <img
                                                    src={review.image}
                                                    alt={review.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                                                <Quote size={12} fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground font-['Oswald']">{review.name}</h3>
                                            <div className="flex gap-0.5 justify-center text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        className={i < review.rating ? "text-amber-400" : "text-muted-foreground/30"}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground font-bold text-sm md:text-base leading-relaxed italic max-w-sm">
                                            "{review.text}"
                                        </p>

                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                                            {review.date}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="hidden md:block">
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 text-foreground transition-all"
                            onClick={prevSlide}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 text-foreground transition-all"
                            onClick={nextSlide}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-12">
                        {[...Array(Math.ceil(reviews.length / 2))].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1);
                                    setCurrentIndex(idx);
                                }}
                                className={cn(
                                    "h-2.5 rounded-full transition-all duration-500",
                                    idx === currentIndex
                                        ? "w-8 bg-primary shadow-glow"
                                        : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
