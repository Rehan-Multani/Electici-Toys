import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, Star, Share2, Heart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export function QuickView({ product, open, onOpenChange }) {
    const addItem = useCartStore((state) => state.addItem);

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="bg-secondary/20 flex items-center justify-center p-0 relative overflow-hidden h-full min-h-[400px]">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full p-12">
                                <div className="text-9xl relative z-10 motion-safe:animate-bounce">🎮</div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Badge className="mb-2 font-bold tracking-widest uppercase">{product.category}</Badge>
                                <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">{product.name}</DialogTitle>
                                <div className="sr-only">
                                    <DialogDescription>Quick view details for {product.name}</DialogDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50"><Heart className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50"><Share2 className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`h-4 w-4 ${s <= Math.floor(product.rating) ? 'fill-current' : ''}`} />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">{product.rating} ({product.numReviews || product.reviews?.length || 0} reviews)</span>
                        </div>

                        <p className="text-muted-foreground mb-8 line-clamp-3 italic">
                            {product.description}
                        </p>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-4xl font-black italic tracking-tighter">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-muted-foreground line-through decoration-primary/50">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-full font-black italic tracking-tighter text-xl group"
                                onClick={() => {
                                    addItem(product);
                                    onOpenChange(false);
                                }}
                            >
                                ADD TO CART <ShoppingCart className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest">
                                Safe Payment • Fast Shipping • 1 Year Warranty
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
