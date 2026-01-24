import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useContentStore } from '../../admin/store/adminContentStore';
import { fadeIn, staggerContainer, scaleUp } from '../lib/animations';

export function About() {
    const { content, fetchPageContent } = useContentStore();
    const { aboutPage } = content;

    useEffect(() => {
        fetchPageContent('aboutPage');
    }, [fetchPageContent]);

    const IconRenderer = ({ name, ...props }) => {
        const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
        return <Icon {...props} />;
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            className="pb-32 overflow-x-hidden"
        >
            {/* Hero Section - New Design */}
            <section className="relative bg-primary pb-20 pt-20 lg:pt-32 overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 text-primary-foreground/30 text-4xl animate-bounce">✨</div>
                <div className="absolute top-20 right-24 text-primary-foreground/30 text-2xl animate-pulse">°</div>
                <div className="absolute top-12 right-40 text-primary-foreground/30 text-3xl">○</div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto mb-8"
                    >
                        <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-primary-foreground mb-6 drop-shadow-sm font-['Oswald']">
                            About Us
                        </h1>
                        <p className="text-lg md:text-xl font-bold italic text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                            {aboutPage.hero.mission || "We are driven by a passion for electric innovation and the joy of movement."}
                        </p>
                    </motion.div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 translate-y-10 md:translate-y-20 max-w-5xl mx-auto">
                        {(aboutPage.images || [
                            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.39.jpeg",
                            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.33.jpeg",
                            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.22.jpeg",
                            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.14.jpeg"
                        ]).map((src, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50, rotate: idx % 2 === 0 ? -3 : 3 }}
                                animate={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? -3 : 3 }}
                                whileHover={{ y: -15, rotate: 0, scale: 1.05 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 bg-white dark:bg-zinc-800"
                            >
                                <img
                                    src={src}
                                    alt={`About Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="h-16 md:h-32" /> {/* Spacer for overlap content */}

            {/* Values Grid */}
            <section className="container mx-auto px-4 pt-12 pb-32">
                <motion.div
                    variants={staggerContainer(0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {aboutPage.values.map((v, index) => {
                        const colorPalettes = [
                            { bg: 'bg-[#C78023]', text: 'text-white', fold: 'text-[#8a5818]' }, // Ochre
                            { bg: 'bg-[#2563EB]', text: 'text-white', fold: 'text-[#1e40af]' }, // Blue
                            { bg: 'bg-[#16A34A]', text: 'text-white', fold: 'text-[#15803d]' }, // Green
                            { bg: 'bg-[#9333EA]', text: 'text-white', fold: 'text-[#7e22ce]' }  // Purple
                        ];
                        const theme = colorPalettes[index % colorPalettes.length];

                        return (
                            <motion.div
                                key={v.id}
                                variants={fadeIn('up')}
                                whileHover={{ y: -5 }}
                                className="relative bg-card rounded-xl shadow-xl overflow-visible mt-4 pb-8 transition-all duration-300 border border-border/10"
                            >
                                {/* Ribbon */}
                                <div
                                    className={`absolute top-6 -left-0 w-[calc(100%+1.5rem)] h-14 ${theme.bg} flex items-center justify-between px-6 shadow-sm z-20`}
                                    style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)' }}
                                >
                                    <span className={`text-sm font-black tracking-[0.1em] uppercase ${theme.text} drop-shadow-md`}>
                                        VALUE 0{index + 1}
                                    </span>
                                    <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                                        <IconRenderer name={v.icon} className={`h-5 w-5 ${theme.text}`} />
                                    </div>
                                </div>

                                {/* Fold Effect (The dark triangle that creates depth) */}
                                <div
                                    className={`absolute top-[5rem] -right-6 w-6 h-6 ${theme.fold} z-10`}
                                    style={{
                                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                                        backgroundColor: 'currentColor'
                                    }}
                                />

                                <div className="pt-28 px-8 pb-4 space-y-4">
                                    <h3 className="text-xl font-bold uppercase text-foreground tracking-tight font-['Oswald']">
                                        {v.title}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                                        {v.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="space-y-6"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9] text-primary">
                        {aboutPage.content.heading}
                    </h2>
                    <div className="space-y-4 text-base md:text-lg text-muted-foreground font-bold italic leading-relaxed opacity-80">
                        {aboutPage.content.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, type: "spring" }}
                    className="aspect-square max-w-[400px] flex items-center justify-center relative mx-auto"
                >
                    <video
                        src="/assets/footer video/free-male-investor-riding-scooter-animation-gif-download-5446246 (1).mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
                    />
                </motion.div>
            </section>
        </motion.div>
    );
}
