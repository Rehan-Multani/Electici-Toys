import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Wishlist() {
    const { items, fetchWishlist } = useWishlistStore();

    React.useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    return (
        <div className="container mx-auto px-4 py-16 pb-32">
            <div className="flex flex-col gap-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-primary leading-none mb-4">FAVORITES</h1>
                        <p className="text-xl font-medium italic text-muted-foreground uppercase">{items.length} Toys you're eyeing</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full border-2 font-black italic">
                        <Link to="/products" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> BACK TO SHOP
                        </Link>
                    </Button>
                </header>

                {items.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-secondary/10 rounded-[4rem] border-2 border-dashed">
                        <div className="text-9xl mb-4 grayscale opacity-50">❤️</div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your wishlist is empty</h2>
                        <p className="text-muted-foreground font-medium italic text-lg max-w-md">Save your favorite electric toys here to keep track of what you want to bring home next!</p>
                        <Button asChild size="lg" className="rounded-full h-14 px-10 font-bold italic tracking-tighter text-xl shadow-xl shadow-primary/20">
                            <Link to="/products">GO EXPLORE TOYS</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        <AnimatePresence mode="popLayout">
                            {items.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
