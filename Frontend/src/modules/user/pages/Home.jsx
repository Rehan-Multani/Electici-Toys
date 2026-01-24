import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useContentStore } from '../../admin/store/adminContentStore';
import { QuickView } from '../components/QuickView';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { staggerContainer, fadeIn, scaleUp } from '../lib/animations';
import { Testimonials } from '../components/Testimonials';

export function Home() {
    const { content, fetchPageContent, loading: contentLoading } = useContentStore();
    const { homePage } = content;
    const [backendCategories, setBackendCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [adIndex, setAdIndex] = useState(0);

    useEffect(() => {
        fetchPageContent('homePage');

        // Fetch categories for the explorer nav
        const fetchCats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/category/all`);
                const data = await response.json();
                if (data.success) {
                    setBackendCategories(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        // Fetch featured products
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/product`);
                const data = await response.json();
                if (data.success) {
                    // Just take first 4 for featured
                    setFeaturedProducts(data.products.slice(0, 4).map(p => ({
                        id: p._id,
                        name: p.productName,
                        price: p.sellingPrice || p.actualPrice,
                        image: p.images && p.images.length > 0 ? p.images[0] : null,
                        category: p.categoryId?.categoryName || 'General',
                        ...p
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            }
        };

        fetchCats();
        fetchProducts();
    }, []);

    // Offer Sets for rotation
    const offerSets = homePage.specialOffers?.offerSets || [
        { images: ['/assets/advertisment/1.png', '/assets/advertisment/3.png', '/assets/advertisment/2.png'] }
    ];

    useEffect(() => {
        if (!offerSets || offerSets.length <= 1) return;
        const adInterval = setInterval(() => {
            // Handle case where admin deletes all sets abruptly
            if (offerSets.length > 0) {
                setAdIndex((prev) => (prev + 1) % offerSets.length);
            }
        }, 4000);
        return () => clearInterval(adInterval);
    }, [offerSets]);

    const currentOfferSet = (offerSets[adIndex] && offerSets[adIndex].images) ? offerSets[adIndex].images : [];

    // Hero section images logic
    const heroImages = (homePage.hero.images && homePage.hero.images.length > 1)
        ? homePage.hero.images
        : [homePage.hero.image || (homePage.hero.images && homePage.hero.images[0])];

    useEffect(() => {
        if (heroImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroImages]);

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    const IconRenderer = ({ name, ...props }) => {
        const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
        return <Icon {...props} />;
    };

    // Helper to render links correctly
    const CTALink = ({ to, children, className = "" }) => {
        if (!to) return <div className={className}>{children}</div>;

        const isExternal = to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:');

        if (isExternal) {
            return (
                <a href={to} className={className} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        }

        return (
            <Link to={to} className={className}>
                {children}
            </Link>
        );
    };

    if (!homePage || !homePage.hero) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-primary font-['Oswald'] text-4xl font-black italic tracking-tighter"
                >
                    ELECTRICI TOYS-HUB
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            className="flex flex-col gap-0 pb-0 overflow-x-hidden"
        >
            {/* Hero Section & Ticker Wrapper */}
            <div className="flex flex-col w-full">
                <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 z-0"
                        >
                            <img
                                src={heroImages[currentImageIndex]}
                                alt="Hero"
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
                        </motion.div>
                    </AnimatePresence>

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            variants={staggerContainer(0.2, 0.5)}
                            className="max-w-5xl mx-auto flex flex-col items-center text-center"
                        >
                            <motion.h1
                                variants={fadeIn('up')}
                                className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] uppercase italic text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                            >
                                {homePage.hero.heading.split(' ').map((word, i) =>
                                    word === 'POWER' ? <span key={i} className="text-primary not-italic text-glow">POWER </span> : word + ' '
                                )}
                            </motion.h1>

                            <motion.div variants={fadeIn('up')}>
                                <CTALink to={homePage.hero.ctaLink}>
                                    <Button
                                        premium
                                        size="lg"
                                        className="rounded-full w-full sm:w-auto px-10 h-16 sm:px-16 sm:h-20 text-lg sm:text-2xl font-black italic tracking-tighter shadow-glow"
                                    >
                                        {homePage.hero.ctaText}
                                    </Button>
                                </CTALink>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

            </div>

            {/* Quick Categories Nav - Full Width */}
            <section className="w-full mt-12 mb-12 bg-primary py-12">
                <div className="flex flex-col items-center text-center mb-8">
                    <h2 className="text-3xl md:text-5xl font-['Oswald'] font-black uppercase italic tracking-tighter text-primary-foreground drop-shadow-sm">
                        Explore Categories
                    </h2>
                </div>
                <div className="flex gap-6 md:gap-12 overflow-x-auto py-8 px-8 snap-x hide-scrollbar justify-start w-full border-b border-border/5 bg-transparent backdrop-blur-sm">
                    {/* Always show "All" */}
                    <a href="/products" className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer snap-start px-2">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-white/20 dark:bg-white/5 group-hover:bg-white/40 transition-all duration-300 transform group-hover:-translate-y-3 shadow-md group-hover:shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-sm group-hover:scale-105 transition-transform duration-300 relative">
                                <img src="/assets/products/WhatsApp Image 2026-01-10 at 16.10.54.jpeg" alt="All Products" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary-foreground/90 group-hover:text-white transition-colors text-center mt-1">All</span>
                    </a>

                    {backendCategories.map((cat, i) => (
                        <a key={cat._id || i} href={`/products?category=${cat.categoryName.toLowerCase()}`} className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer snap-start px-2">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-white/20 dark:bg-white/5 group-hover:bg-white/40 transition-all duration-300 transform group-hover:-translate-y-3 shadow-md group-hover:shadow-xl">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-sm group-hover:scale-105 transition-transform duration-300 relative">
                                    <img src={cat.image || '/assets/products/WhatsApp Image 2026-01-10 at 16.10.55.jpeg'} alt={cat.categoryName} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                </div>
                            </div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary-foreground/90 group-hover:text-white transition-colors text-center mt-1">{cat.categoryName}</span>
                        </a>
                    ))}
                </div>
            </section>



            {/* Featured Products */}
            <section className="container mx-auto px-4 py-24">
                <motion.div
                    variants={fadeIn('up')}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6"
                >
                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-8xl font-['Oswald'] font-black tracking-tighter uppercase italic text-primary leading-[0.8] drop-shadow-md">
                            {homePage.featuredSection.title}
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground font-bold italic opacity-70">
                            {homePage.featuredSection.subtitle}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="w-[220px] md:w-[280px] -mb-8 mr-8 relative z-10 pointer-events-none">
                            <video
                                src="/assets/footer video/free-male-investor-riding-scooter-animation-gif-download-5446246 (1).mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-screen"
                            />
                        </div>
                        <CTALink to={homePage.featuredSection.ctaLink}>
                            <Button variant="link" className="font-black text-xl tracking-tighter uppercase italic group p-0 h-auto gap-3">
                                {homePage.featuredSection.ctaText}
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    →
                                </span>
                            </Button>
                        </CTALink>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {featuredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onQuickView={() => handleQuickView(product)}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Categories */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {homePage.categories.slice(0, 1).map((cat) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className={`h-[380px] md:h-[600px] rounded-[2rem] md:rounded-[3rem] bg-${cat.bgColor} relative overflow-hidden group p-8 md:p-16 flex flex-col justify-end border-2 border-transparent hover:border-${cat.borderColor} transition-all duration-700 shadow-2xl hover:shadow-glow`}
                        >
                            <motion.img
                                initial={{ scale: 1.2, rotate: -5 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1.2 }}
                                src={cat.image}
                                alt={cat.name}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] object-contain opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 pointer-events-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                            />
                            <div className="relative z-10">
                                <h3 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] mb-4 md:mb-6 drop-shadow-lg">
                                    {cat.title.split('\\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i === 0 && <br />}
                                        </React.Fragment>
                                    ))}
                                </h3>
                                <p className="max-w-xs text-muted-foreground font-black mb-6 md:mb-10 uppercase tracking-[0.2em] text-[10px] md:text-xs opacity-80">{cat.description}</p>
                                <CTALink to={cat.ctaLink} className="w-fit">
                                    <Button premium size="lg" className="rounded-full px-8 md:px-12 h-12 md:h-14 font-black italic shadow-2xl text-sm md:text-base">{cat.ctaText}</Button>
                                </CTALink>
                            </div>
                        </motion.div>
                    ))}

                    <div className="grid grid-cols-1 gap-8">
                        {homePage.categories.slice(1).map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.2, type: "spring" }}
                                className={`h-[200px] md:h-[284px] rounded-[2rem] md:rounded-[3rem] bg-${cat.bgColor} relative overflow-hidden group p-6 md:p-12 flex flex-col justify-center border-2 border-transparent hover:border-${cat.borderColor} transition-all duration-700 shadow-xl hover:shadow-glow`}
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[150%] object-contain opacity-20 group-hover:opacity-40 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 pointer-events-none filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                                />
                                <div className="relative z-10">
                                    <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 leading-none">{cat.title}</h3>
                                    <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mb-4 md:mb-8 opacity-70">{cat.description}</p>
                                    <CTALink to={cat.ctaLink} className="w-fit">
                                        <Button variant="outline" className="rounded-full border-2 border-foreground/10 font-black italic h-10 md:h-12 px-6 md:px-8 hover:bg-foreground hover:text-background transition-colors shadow-lg text-xs md:text-sm">{cat.ctaText}</Button>
                                    </CTALink>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Markers - Colorful Circles */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                    {homePage.trustMarkers.map((item, i) => {
                        const colors = [
                            'bg-[#D12F53]', // Red/Pink
                            'bg-[#E87E23]', // Orange
                            'bg-[#F3C623]', // Golden Yellow
                            'bg-[#2ECC71]'  // Green
                        ];
                        const bgColor = colors[i % colors.length];

                        return (
                            <motion.div
                                key={i}
                                variants={fadeIn('up')}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group relative"
                            >
                                <div className={`w-[280px] h-[280px] ${bgColor} rounded-full flex flex-col items-center justify-center text-center px-8 py-6 text-white transition-transform duration-300 hover:scale-105 z-10 relative`}>
                                    <div className="mb-2 p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                        <IconRenderer name={item.icon} className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider mb-1 font-['Oswald'] leading-tight">{item.title}</h3>
                                    <div className="w-12 h-0.5 bg-white/50 mb-2" />

                                    <div className="flex flex-col gap-1 text-[11px] font-medium text-white/90 mb-2 w-full">
                                        <p className="line-clamp-2 leading-relaxed">{item.description}</p>
                                        <div className="mt-1 flex flex-col gap-0.5 opacity-80">
                                            <span>• Premium Quality</span>
                                            <span>• Verified</span>
                                        </div>
                                    </div>

                                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-auto mb-1 hover:text-white/80 transition-colors bg-white/20 dark:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <LucideIcons.Flower2 className="w-3 h-3" />
                                        More
                                    </button>
                                </div>

                                {/* Reflection Shadow Effect */}
                                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 ${bgColor} opacity-20 blur-xl rounded-[100%]`} />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full h-8 bg-gradient-to-b from-current to-transparent opacity-10 transform scale-y-[-1] mask-image-gradient" style={{ color: bgColor }} />
                            </motion.div>
                        );
                    })}
                </div>
            </section>
            <section className="w-full bg-primary py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-5xl md:text-7xl font-['Oswald'] font-black text-primary-foreground tracking-tighter uppercase italic drop-shadow-sm">
                            {homePage.specialOffers?.title || 'Special Offers'}
                        </h2>
                        <div className="h-1.5 w-32 bg-primary-foreground mt-4 rounded-full shadow-glow" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center relative">
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/20 blur-[100px] rounded-full -z-10" />

                        <AnimatePresence mode='wait'>
                            {/* Image 1 - Left Tilted */}
                            <motion.div
                                key={`ad-left-${adIndex}`}
                                initial={{ opacity: 0, x: -50, rotate: -10 }}
                                animate={{ opacity: 1, x: 0, rotate: -5 }}
                                exit={{ opacity: 0, x: -50, rotate: -10 }}
                                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-sm"
                            >
                                <img src={currentOfferSet[0] || '/placeholder.jpg'} alt="Ad 1" className="w-full h-auto drop-shadow-2xl hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300" />
                            </motion.div>

                            {/* Image 2 - Center Pop-up (Main) */}
                            <motion.div
                                key={`ad-center-${adIndex}`}
                                initial={{ opacity: 0, scale: 0.5, y: 100 }}
                                animate={{ opacity: 1, scale: 1.2, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 100 }}
                                whileHover={{ scale: 1.3 }}
                                transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                                className="w-full max-w-sm z-20"
                            >
                                <img src={currentOfferSet[1] || '/placeholder.jpg'} alt="Ad Main" className="w-full h-auto drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]" />
                            </motion.div>

                            {/* Image 3 - Right Tilted */}
                            <motion.div
                                key={`ad-right-${adIndex}`}
                                initial={{ opacity: 0, x: 50, rotate: 10 }}
                                animate={{ opacity: 1, x: 0, rotate: 5 }}
                                exit={{ opacity: 0, x: 50, rotate: 10 }}
                                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-sm"
                            >
                                <img src={currentOfferSet[2] || '/placeholder.jpg'} alt="Ad 2" className="w-full h-auto drop-shadow-2xl hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>


            <Testimonials />

            {/* Connect Line */}
            <div className="w-full bg-background/80 backdrop-blur-md border-t border-border/10 py-6 flex flex-col md:flex-row items-center justify-center gap-3 relative z-20">
                <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">Have questions?</span>
                <Link to="/contact" className="group flex items-center gap-2">
                    <span className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                        Connect With Us
                    </span>
                    <LucideIcons.ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </Link>
            </div>

            {/* Moving Footer Video - Cycle */}
            <div className="w-full overflow-hidden bg-background py-2 relative -mb-4 z-10"> {/* Negative margin to blend with footer if needed */}
                <motion.div
                    initial={{ x: "-30vw" }}
                    animate={{ x: "100vw" }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-[150px] md:w-[250px]"
                >
                    <video
                        src="/assets/footer video/cycle.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto object-contain"
                    />
                </motion.div>
                {/* Road Line */}
                <div className="absolute bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>

            {/* Quick View Modal */}
            <QuickView
                product={selectedProduct}
                open={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
            />
        </motion.div>
    );
}
