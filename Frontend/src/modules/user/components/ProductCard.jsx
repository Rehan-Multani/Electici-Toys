import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Maximize2, Star } from 'lucide-react';
import { Card } from './ui/card';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

import { productCardVariants, imageHover } from '../lib/animations';

export function ProductCard({ product, onQuickView }) {
    const addItem = useCartStore((state) => state.addItem);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addItem(product);
        toast({
            title: "ADDED TO CART! 🛒",
            description: `${product.name.toUpperCase()} IS NOW IN YOUR BAG.`,
        });
    };

    const handleToggleWishlist = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast({
                title: "LOGIN REQUIRED",
                description: "Please login to save items to your wishlist.",
                variant: "destructive",
            });
            // Optional: navigate('/login');
            return;
        }

        toggleWishlist(product);
        toast({
            title: isInWishlist ? "REMOVED FROM WISHLIST" : "ADDED TO WISHLIST! ❤️",
            description: `${product.name.toUpperCase()} HAS BEEN UPDATED.`,
        });
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        if (onQuickView) onQuickView(product);
    };

    const discountPercentage = product.originalPrice && product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            whileHover="hover"
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer h-full"
        >
            <Card className="relative h-full flex flex-col overflow-hidden border border-border/50 bg-card text-card-foreground rounded-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">

                {/* Image Section */}
                <div className="relative aspect-square bg-secondary/20 overflow-hidden">
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-20 shadow-lg shadow-red-500/20">
                            {discountPercentage}% OFF
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <button
                            onClick={handleToggleWishlist}
                            className="bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-background"
                        >
                            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <button
                            onClick={handleQuickView}
                            className="bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Image */}
                    <motion.div
                        variants={imageHover}
                        className="w-full h-full"
                    >
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl select-none bg-muted">🧸</div>
                        )}
                    </motion.div>


                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col p-5 border-t border-border/50 bg-primary/5">
                    {/* Category & Rating */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-foreground">
                                {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black italic tracking-tight text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors uppercase">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-auto flex items-baseline gap-2">
                        <span className="text-lg font-black italic tracking-tighter text-primary">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through font-bold">
                                ₹{product.originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
