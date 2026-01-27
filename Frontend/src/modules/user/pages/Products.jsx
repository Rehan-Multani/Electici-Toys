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
                    <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden bg-primary p-5 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg relative min-h-[140px] md:min-h-[200px]">
                        {/* Background Pattern/Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 md:-mr-20 md:-mt-20 pointer-events-none" />

                        <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-primary-foreground leading-none mb-2 md:mb-3 drop-shadow-md font-['Oswald']">SHOP ALL</h1>
                            <p className="text-sm md:text-lg text-primary-foreground/90 font-medium italic tracking-wide max-w-[250px] md:max-w-none">Discover our full range of electric excitement.</p>
                        </div>
                    </div>

                    {/* Toolbar: Categories & Sort */}
                    <div className="sticky top-4 z-40 w-full mb-6 md:mb-8">
                        <div className="glass rounded-full p-2 flex flex-row items-center justify-between gap-2 md:gap-4 shadow-xl">

                            {/* Category Filters */}
                            <div className="flex-1 overflow-x-auto hide-scrollbar px-1 mask-linear min-w-0">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    {displayCategories.map((cat) => {
                                        const isActive = selectedCategory === cat;
                                        return (
                                            <motion.button
                                                key={cat}
                                                whileHover="hover"
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`
                                                relative px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex-shrink-0 select-none
                                                ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                                            `}
                                            >
                                                <span className="relative z-10 block">
                                                    {cat === "All" ? "ALL TOYS" : cat.toUpperCase()}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-8 bg-border/50 mx-1" />

                            {/* Sort Dropdown */}
                            <div className="flex-shrink-0 relative z-20">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-auto md:w-[180px] h-9 md:h-10 border border-border/20 bg-secondary/50 hover:bg-secondary/80 rounded-full px-3 md:px-4 gap-2 transition-colors focus:ring-0 focus:ring-offset-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="hidden md:block font-black italic tracking-tighter text-primary text-xs uppercase truncate max-w-[100px]">
                                                <SelectValue />
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent align="end" sideOffset={8} className="w-[180px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/20 shadow-xl z-50">
                                        <SelectItem value="featured" className="text-[10px] font-black italic uppercase tracking-wider text-muted-foreground focus:text-foreground focus:bg-primary/20 cursor-pointer py-2.5">FEATURED</SelectItem>
                                        <SelectItem value="price-low" className="text-[10px] font-black italic uppercase tracking-wider text-muted-foreground focus:text-foreground focus:bg-primary/20 cursor-pointer py-2.5">PRICE: LOW TO HIGH</SelectItem>
                                        <SelectItem value="price-high" className="text-[10px] font-black italic uppercase tracking-wider text-muted-foreground focus:text-foreground focus:bg-primary/20 cursor-pointer py-2.5">PRICE: HIGH TO LOW</SelectItem>
                                        <SelectItem value="rating" className="text-[10px] font-black italic uppercase tracking-wider text-muted-foreground focus:text-foreground focus:bg-primary/20 cursor-pointer py-2.5">TOP RATED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>



                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10">
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
