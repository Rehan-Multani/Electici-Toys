import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { QuickView } from '../components/QuickView';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAdminProductStore } from '../../admin/store/adminProductStore';

export function Products() {
    const { products, categories, fetchCategories } = useAdminProductStore();
    const [searchParams] = useSearchParams();
    const categoryFromQuery = searchParams.get('category');
    const searchQueryFromUrl = searchParams.get('search');

    useEffect(() => {
        fetchCategories();
        useAdminProductStore.getState().fetchProducts();
    }, [fetchCategories]);

    const displayCategories = useMemo(() => {
        return ["All", ...categories.map(c => c.categoryName || c)];
    }, [categories]);

    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        if (categoryFromQuery) {
            const found = displayCategories.find(cat => cat.toLowerCase() === categoryFromQuery.toLowerCase());
            if (found) {
                setSelectedCategory(found);
            }
        }
    }, [categoryFromQuery, displayCategories]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [sortBy, setSortBy] = useState("featured");

    const filteredProducts = useMemo(() => {
        let result = products;

        // Apply search filter if present in URL
        if (searchQueryFromUrl) {
            const query = searchQueryFromUrl.toLowerCase();
            result = result.filter(p => 
                p.name?.toLowerCase().includes(query) || 
                p.description?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory !== "All") {
            result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
        if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

        return result;
    }, [products, selectedCategory, sortBy, searchQueryFromUrl]);

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
            <div className="container mx-auto px-4 py-12 flex-1 pb-0">
                <div className="flex flex-col gap-0">
                    {/* Header Section */}
                    {/* Header Section */}
                    {/* Header Section */}
                    <div className="mb-0 flex items-center justify-between overflow-hidden bg-primary p-6 md:p-12 rounded-[2.5rem] shadow-lg relative">
                        {/* Background Pattern/Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

                        <div className="relative z-10 max-w-xl">
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-primary-foreground leading-none mb-3 drop-shadow-md font-['Oswald']">SHOP ALL</h1>
                            <p className="text-base md:text-lg text-primary-foreground/90 font-medium italic tracking-wide">Discover our full range of electric excitement.</p>
                        </div>

                    </div>

                    {/* Toolbar: Categories & Sort */}
                    <div className="sticky top-4 z-40 w-full mb-8">
                        <div className="bg-background/60 dark:bg-card/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 md:p-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 shadow-2xl shadow-black/20 ring-1 ring-white/5 dark:ring-white/10">

                            {/* Category Filters */}
                            <div className="flex-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
                                <div className="flex items-center gap-2 p-2 px-4">
                                    {displayCategories.map((cat) => {
                                        const isActive = selectedCategory === cat;
                                        return (
                                            <motion.button
                                                key={cat}
                                                whileHover="hover"
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`
                                                relative px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 flex-shrink-0 select-none
                                                ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                                            `}
                                            >
                                                {/* Top Premium Indicator Line */}
                                                {!isActive && (
                                                    <motion.div
                                                        variants={{
                                                            hover: { scaleX: 1, opacity: 1, y: -2 },
                                                            initial: { scaleX: 0, opacity: 0, y: 0 }
                                                        }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                        className="absolute top-0 left-4 right-4 h-[3px] bg-primary rounded-full shadow-glow origin-center"
                                                    />
                                                )}

                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeCategory"
                                                        className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                                <motion.span
                                                    variants={{
                                                        hover: { y: -1, scale: 1.05 }
                                                    }}
                                                    className="relative z-10 block"
                                                >
                                                    {cat === "All" ? "ALL TOYS" : cat.toUpperCase()}
                                                </motion.span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

                            {/* Sort Dropdown */}
                            <div className="flex-shrink-0 w-full md:w-auto flex justify-end px-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-auto h-10 border-0 bg-white/5 hover:bg-white/10 rounded-full px-4 gap-3 transition-colors focus:ring-0 focus:ring-offset-0">
                                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <SlidersHorizontal className="h-3.5 w-3.5" /> <span className="hidden sm:inline">SORT:</span>
                                        </span>
                                        <span className="font-black italic tracking-tighter text-primary text-xs uppercase">
                                            <SelectValue />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent align="end" sideOffset={5} className="w-[170px] bg-[#0a0a0a] border border-white/10 backdrop-blur-xl">
                                        <SelectItem value="featured" className="text-[10px] font-black italic uppercase tracking-wider text-gray-400 focus:text-white focus:bg-primary/20 cursor-pointer py-2">FEATURED</SelectItem>
                                        <SelectItem value="price-low" className="text-[10px] font-black italic uppercase tracking-wider text-gray-400 focus:text-white focus:bg-primary/20 cursor-pointer py-2">PRICE: LOW TO HIGH</SelectItem>
                                        <SelectItem value="price-high" className="text-[10px] font-black italic uppercase tracking-wider text-gray-400 focus:text-white focus:bg-primary/20 cursor-pointer py-2">PRICE: HIGH TO LOW</SelectItem>
                                        <SelectItem value="rating" className="text-[10px] font-black italic uppercase tracking-wider text-gray-400 focus:text-white focus:bg-primary/20 cursor-pointer py-2">TOP RATED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>



                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProductCard
                                        product={product}
                                        onQuickView={() => handleQuickView(product)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-24 text-center space-y-4">
                            <div className="text-6xl text-muted-foreground opacity-20">🔍</div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">No toys found</h3>
                            <p className="text-muted-foreground italic">
                                {searchQueryFromUrl 
                                    ? `No results for "${searchQueryFromUrl}"` 
                                    : "Try a different category or search term."}
                            </p>
                            <Button 
                                variant="outline" 
                                className="rounded-full border-2" 
                                onClick={() => {
                                    setSelectedCategory("All");
                                    if (searchQueryFromUrl) {
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('search');
                                        window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
                                    }
                                }}
                            >
                                CLEAR FILTERS
                            </Button>
                        </div>
                    )}
                </div>

            </div>

            <QuickView
                product={selectedProduct}
                open={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
            />

            {/* Moving Video Section - Right to Left */}
            <div className="w-full overflow-hidden relative pointer-events-none mt-0 z-10 flex items-end -mb-9">
                <motion.div
                    initial={{ x: "100vw" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-[150px] md:w-[250px]"
                >
                    <video
                        src="/assets/footer video/video3 (3).mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto object-contain block mix-blend-multiply dark:mix-blend-screen"
                    />
                </motion.div>
            </div>
        </div>
    );
}
