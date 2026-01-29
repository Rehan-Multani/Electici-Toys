import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../lib/axios'; // Use shared axios instance
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Shield, Truck, Minus, Plus, Zap } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductReviews } from '../components/ProductReviews';

export function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // { color: '', images: [] }

    // Store hooks
    const addItem = useCartStore((state) => state.addItem);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    // Note: This checks local wishlist store which might use ID string or number. Ensure consistency.
    const isInWishlist = useWishlistStore((state) => state.isInWishlist(id));

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Fetch product from backend
                // The URL id is the mongo _id
                const response = await api.get(`/product/${id}`); // Assuming backend route is /api/v1/product/:id

                if (response.data.success || response.data) {
                    // Normalize data structure
                    // Backend might return { success: true, product: {...} } or just {...}
                    const p = response.data.product || response.data;

                    let image = p.images && p.images.length > 0 ? p.images[0] : null;
                    if (image && image.endsWith(':1')) image = image.replace(/:\d+$/, '');

                    const productData = {
                        id: p._id,
                        name: p.productName,
                        category: p.categoryId?.categoryName || 'Unknown',
                        price: p.sellingPrice || p.actualPrice,
                        originalPrice: p.actualPrice,
                        rating: p.rating || 0,
                        numReviews: p.numReviews || 0,
                        description: p.description,
                        image: image,
                        images: p.images || [],
                        variants: p.variants || [],
                        stock: p.quantity,
                        isNew: p.createdAt && (new Date() - new Date(p.createdAt) < 7 * 24 * 60 * 60 * 1000),
                        id: p._id,
                        ...p
                    };

                    setProduct(productData);

                    // Initialize Variant & Image
                    if (productData.variants && productData.variants.length > 0) {
                        const firstVar = productData.variants[0];
                        setSelectedVariant(firstVar);
                        if (firstVar.images && firstVar.images.length > 0) {
                            setActiveImage(firstVar.images[0]);
                        } else {
                            // fallback to main images if variant has none (rare)
                            setActiveImage(productData.images && productData.images.length > 0 ? productData.images[0] : image);
                        }
                    } else {
                        // No variants, standard behavior
                        if (productData.images && productData.images.length > 0) {
                            setActiveImage(productData.images[0]);
                        } else {
                            setActiveImage(image);
                        }
                    }
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Failed to fetch product", err);
                setError("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
            window.scrollTo(0, 0);
        }
    }, [id]);

    // Force update image when variant changes
    useEffect(() => {
        if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
            setActiveImage(selectedVariant.images[0]);
        }
    }, [selectedVariant]);

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading Toy...</p>
        </div>
    );

    if (error || !product) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Product Not Found</h2>
            <Button onClick={() => navigate('/products')}>Return to Shop</Button>
        </div>
    );

    const handleBuyNow = () => {
        const item = {
            ...product,
            color: selectedVariant ? selectedVariant.color : null,
            image: activeImage || product.image
        };
        for (let i = 0; i < quantity; i++) {
            addItem(item);
        }
        navigate('/checkout');
    };

    const handleAddToCart = () => {
        const item = {
            ...product,
            color: selectedVariant ? selectedVariant.color : null,
            image: activeImage || product.image
        };
        for (let i = 0; i < quantity; i++) {
            addItem(item);
        }
    };

    return (
        <div className="pb-24">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 py-8">
                <nav className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/products" className="hover:text-primary">Shop</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 max-w-[500px] mx-auto lg:mx-0 lg:ml-12"
                    >
                        <div className="aspect-square rounded-none border-2 border-primary/10 bg-secondary/20 flex items-center justify-center relative overflow-hidden group">
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                                <div className="text-[12rem] select-none">🎮</div>
                            )}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-3 md:gap-4">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-none border ${activeImage === img ? 'border-primary' : 'border-primary/10'} bg-secondary/20 flex items-center justify-center text-3xl cursor-pointer hover:bg-secondary/40 transition-colors overflow-hidden`}
                                        onClick={() => {
                                            setActiveImage(img);
                                            // Check if this image belongs to a variant
                                            if (product.variants && product.variants.length > 0) {
                                                const relatedVariant = product.variants.find(v =>
                                                    (v.images && v.images.includes(img)) ||
                                                    (v.images && v.images[0] === img) // simplified check since variants currently enforce 1 image
                                                );
                                                if (relatedVariant) {
                                                    setSelectedVariant(relatedVariant);
                                                }
                                            }
                                        }}
                                    >
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
                                        ) : '🎮'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-start"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <Badge className="rounded-none font-black tracking-widest uppercase py-1 px-3">{product.category}</Badge>
                            {product.isNew && <Badge variant="success" className="rounded-none font-black tracking-widest uppercase py-1 px-3">NEW ARRIVAL</Badge>}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`h-4 w-4 md:h-5 md:w-5 ${s <= Math.floor(product.rating) ? 'fill-current' : ''}`} />
                                ))}
                            </div>
                            <span className="text-xs md:text-sm font-black italic text-muted-foreground uppercase">{product.rating} / 5.0 Rating</span>
                        </div>

                        <p className="text-sm md:text-base text-muted-foreground font-medium italic mb-6 leading-relaxed border-l-4 border-primary/30 pl-4 py-2 bg-primary/5">
                            {product.description || "No description available for this awesome toy."}
                        </p>

                        <div className="flex items-center gap-6 mb-8">
                            <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary">₹{product.price?.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-lg md:text-2xl text-muted-foreground line-through decoration-primary/50 italic tracking-tighter opacity-50">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>

                        {/* Variant Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8 space-y-3">
                                <div className="mb-8 space-y-3">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Color: <span className="text-foreground">{selectedVariant ? selectedVariant.color : 'Select'}</span>
                                    </span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    if (v.images && v.images.length > 0) setActiveImage(v.images[0]);
                                                }}
                                                className={`
                                                min-w-[4rem] px-4 py-3 rounded-xl border-2 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                                                ${selectedVariant === v
                                                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                        : 'border-secondary/40 bg-transparent hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                                    }
                                            `}
                                            >
                                                {/* Optional: Show tiny dot of image if available? No, user just asked for Color Name */}
                                                {v.color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-8">
                            <div className="flex items-center justify-between bg-primary/5 rounded-none p-1 border-2 border-primary/20 focus-within:border-primary transition-all w-full sm:w-auto">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-none h-10 w-10 hover:bg-primary/10"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-black italic text-lg">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-none h-10 w-10 hover:bg-primary/10"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="flex-1 sm:flex-none h-12 rounded-none font-black italic tracking-tighter text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group px-8"
                                    onClick={handleAddToCart}
                                >
                                    ADD TO CART <ShoppingCart className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                </Button>

                                <Button
                                    size="lg"
                                    className="flex-1 sm:flex-none h-12 rounded-none font-black italic tracking-tighter text-base bg-black text-white hover:bg-black/90 shadow-[4px_4px_0px_0px_rgba(199,128,35,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group px-8"
                                    onClick={handleBuyNow}
                                >
                                    BUY NOW <Zap className="ml-2 h-4 w-4 fill-white group-hover:scale-110 transition-transform" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 w-12 rounded-none border-2 border-primary/20 hover:border-primary flex-shrink-0"
                                    onClick={() => toggleWishlist(product)}
                                >
                                    <Heart className={isInWishlist ? "fill-primary text-primary" : ""} />
                                </Button>
                            </div>
                        </div>

                        {/* Dynamic Specifications from Admin */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-8 border-t border-primary/10">
                                {product.specifications.map((spec, index) => (
                                    <div key={index} className="flex gap-3 items-center group">
                                        <div className="w-8 h-8 rounded-none bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                                            {spec.key.toLowerCase().includes('warranty') ? <Shield className="h-4 w-4" /> :
                                                spec.key.toLowerCase().includes('delivery') ? <Truck className="h-4 w-4" /> :
                                                    <Zap className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mb-1">{spec.key}</span>
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider truncate">{spec.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 md:mt-24">
                    <ProductReviews reviews={product.reviews || []} productId={product._id} />
                </div>
            </div>

            {/* Related Products - Removed for now until we implement backend filtering for 'User Also Liked' */}
        </div>
    );
}
