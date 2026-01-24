import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useContentStore } from '../../admin/store/adminContentStore';
import { ScooterScroll } from '../components/ScooterScroll';
import { Button } from '../components/ui/button';
import { fadeIn, staggerContainer } from '../lib/animations';

export function Experience() {
    const { content } = useContentStore();
    const { experiencePage } = content;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            className="bg-[#050505] min-h-screen text-white/90 selection:bg-white/20 selection:text-white"
        >
            <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-center items-center">
                {/* --- MOBILE VIEW --- */}
                <div className="md:hidden w-full h-full relative">
                    {experiencePage.mobileScrolls.map((item) => (
                        <ScrollText key={item.id} start={item.start} end={item.end} align={item.align} mobile>
                            <h1 className="text-6xl font-black tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none italic">{item.heading}</h1>
                            {item.description && (
                                <p className="mt-4 text-xs font-black opacity-60 uppercase tracking-[0.3em] leading-tight px-12">
                                    {item.description}
                                </p>
                            )}
                        </ScrollText>
                    ))}
                </div>
            </div>

            <ScooterScroll />

            {/* Footer Section */}
            <div className="min-h-[70vh] md:h-screen py-32 md:py-0 bg-[#050505] flex flex-col items-center justify-center relative z-20 overflow-hidden">
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                </div>

                <motion.div
                    variants={staggerContainer(0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="relative z-10 text-center space-y-12 max-w-5xl px-4"
                >
                    <motion.p
                        variants={fadeIn('up')}
                        className="text-primary text-sm font-black uppercase tracking-[0.4em] drop-shadow-glow"
                    >
                        {experiencePage.footer.tagline}
                    </motion.p>
                    <motion.h2
                        variants={fadeIn('up')}
                        className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent italic"
                    >
                        {experiencePage.footer.heading.split('\\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}<br />
                            </React.Fragment>
                        ))}
                    </motion.h2>

                    <motion.div
                        variants={fadeIn('up')}
                        className="flex flex-col md:flex-row items-center gap-8 justify-center pt-12"
                    >
                        {experiencePage.footer.buttons.map((btn, i) => (
                            <a key={i} href={btn.link} className="w-full md:w-auto">
                                <Button
                                    variant={btn.variant === 'outline' ? 'ghost' : 'default'}
                                    premium={btn.variant !== 'outline'}
                                    className={`w-full md:w-64 h-20 rounded-full text-xl font-black italic tracking-tighter shadow-2xl ${btn.variant === 'outline'
                                            ? '!bg-white !text-black hover:!bg-white/90'
                                            : ''
                                        }`}
                                >
                                    {btn.text}
                                </Button>
                            </a>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Bottom Brand */}
                <div className="absolute bottom-12 left-0 right-0 text-center">
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">
                        {experiencePage.footer.copyright}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// Helper to fade text in/out based on scroll range
function ScrollText({ children, start, end, align = "center", mobile = false }) {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(
        scrollYProgress,
        [start, start + 0.05, end - 0.05, end],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollYProgress,
        [start, end],
        [50, -50]
    );

    const positionClass = mobile
        ? "absolute top-1/2 left-0 -translate-y-1/2"
        : "absolute";

    return (
        <motion.div
            style={{ opacity, y }}
            className={`${positionClass} w-full px-8 ${align === 'center' ? 'text-center' :
                align === 'start' ? 'text-left' : 'text-right'
                }`}
        >
            {children}
        </motion.div>
    );
}
