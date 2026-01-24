import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useContentStore } from '../../admin/store/adminContentStore';
import { cn } from "../../../lib/utils";

const frameCount = 240;

// Progressive loading strategy: Load critical frames first, then fill in gaps
const getCriticalFrames = () => {
    const critical = [];
    // Load every 10th frame first (24 frames = ~90% less data)
    for (let i = 1; i <= frameCount; i += 10) {
        critical.push(i);
    }
    return critical;
};

const getRemainingFrames = () => {
    const critical = getCriticalFrames();
    const remaining = [];
    for (let i = 1; i <= frameCount; i++) {
        if (!critical.includes(i)) {
            remaining.push(i);
        }
    }
    return remaining;
};

export function ScooterScroll() {
    const { content } = useContentStore();
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [criticalFramesLoaded, setCriticalFramesLoaded] = useState(false);
    const [allFramesLoaded, setAllFramesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const frameImagesRef = useRef([]);

    // Scroll progress for the entire container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });


    // Map scroll (0-1) to frame index (0-239)
    const currentIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

    // Phase 1: Load critical frames (every 10th frame) for instant start
    useEffect(() => {
        const criticalFrames = getCriticalFrames();
        let loadedCount = 0;

        frameImagesRef.current = new Array(frameCount);

        criticalFrames.forEach((frameNum) => {
            const img = new Image();
            const paddedIndex = frameNum.toString().padStart(3, '0');
            img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;

            img.onload = () => {
                frameImagesRef.current[frameNum - 1] = img;
                loadedCount++;
                setLoadingProgress(Math.round((loadedCount / criticalFrames.length) * 100));

                if (loadedCount === criticalFrames.length) {
                    setCriticalFramesLoaded(true);
                }
            };

            img.onerror = () => {
                loadedCount++;
                if (loadedCount === criticalFrames.length) {
                    setCriticalFramesLoaded(true);
                }
            };
        });
    }, []);

    // Phase 2: Load remaining frames in background after critical frames are ready
    useEffect(() => {
        if (!criticalFramesLoaded) return;

        const remainingFrames = getRemainingFrames();
        let loadedCount = 0;

        // Use requestIdleCallback for non-blocking background loading
        const loadNextBatch = (startIdx) => {
            const batchSize = 10;
            const batch = remainingFrames.slice(startIdx, startIdx + batchSize);

            batch.forEach((frameNum) => {
                const img = new Image();
                const paddedIndex = frameNum.toString().padStart(3, '0');
                img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;

                img.onload = () => {
                    frameImagesRef.current[frameNum - 1] = img;
                    loadedCount++;
                    if (loadedCount === remainingFrames.length) {
                        setAllFramesLoaded(true);
                    }
                };

                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === remainingFrames.length) {
                        setAllFramesLoaded(true);
                    }
                };
            });

            if (startIdx + batchSize < remainingFrames.length) {
                setTimeout(() => loadNextBatch(startIdx + batchSize), 50);
            }
        };

        loadNextBatch(0);
    }, [criticalFramesLoaded]);


    useEffect(() => {
        const render = (index) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            const frameIndex = Math.round(index);
            let img = frameImagesRef.current[frameIndex];

            // If exact frame isn't loaded, find nearest loaded frame
            if (!img || !img.complete) {
                // Look for nearest loaded frame
                for (let offset = 1; offset <= 10; offset++) {
                    const before = frameImagesRef.current[Math.max(0, frameIndex - offset)];
                    const after = frameImagesRef.current[Math.min(frameCount - 1, frameIndex + offset)];

                    if (before && before.complete && before.naturalHeight !== 0) {
                        img = before;
                        break;
                    }
                    if (after && after.complete && after.naturalHeight !== 0) {
                        img = after;
                        break;
                    }
                }
            }

            // Clear canvas
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            if (img && img.complete && img.naturalHeight !== 0) {
                // Determine if mobile (portrait) and image is landscape
                const isMobile = width < 768;

                if (isMobile) {
                    // Mobile: Fit to width but zoom in significantly (1.75x) to avoid tiny strip look
                    // This accepts some cropping on sides (wheels) to make the bike visible
                    const scale = (width / img.width) * 1.75;

                    const x = (width / 2) - (img.width / 2) * scale;
                    const y = (height / 2) - (img.height / 2) * scale;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                } else {
                    // Desktop: Standard cover
                    const scale = Math.max(width / img.width, height / img.height);
                    const x = (width / 2) - (img.width / 2) * scale;
                    const y = (height / 2) - (img.height / 2) * scale;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                }
            }
        };

        const unsubscribe = currentIndex.on("change", (latest) => {
            render(latest);
        });

        // Initial render
        render(0);

        return () => unsubscribe();
    }, [currentIndex, criticalFramesLoaded]);

    return (
        <div ref={containerRef} className="h-[400vh] relative bg-[#050505]">
            <div className="sticky top-0 w-full h-screen overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover block"
                />

                {/* --- DESKTOP VIEW SCROLL TEXT (Sticky Context) --- */}
                <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
                    {content.experiencePage.desktopScrolls.map((item) => (
                        <ScrollText key={item.id} start={item.start} end={item.end} align={item.align} scrollYProgress={scrollYProgress}>
                            <div className={cn(
                                "max-w-xl drop-shadow-xl",
                                item.align === 'start' && "md:ml-32",
                                item.align === 'end' && "md:mr-32 ml-auto",
                                item.align === 'center' && "mx-auto"
                            )}>
                                <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">{item.heading}</h2>
                                {item.description && <p className="text-xl text-white/80 font-medium">{item.description}</p>}
                                {item.ctaText && (
                                    <div className="mt-8">
                                        <a href={item.ctaLink} className="pointer-events-auto inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-bold tracking-wide hover:scale-105 transition-transform shadow-lg">
                                            {item.ctaText}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </ScrollText>
                    ))}
                </div>

                {/* Mobile Top Overlay */}
                <div className="md:hidden absolute top-0 left-0 w-full pt-20 px-6 flex flex-col items-center justify-start pointer-events-none z-10">
                    <h2 className="text-white font-black italic tracking-tighter text-5xl uppercase drop-shadow-2xl text-center leading-[0.9]">
                        {content.experiencePage.mobileOverlay.top.line1}<br />
                        <span className="text-primary">{content.experiencePage.mobileOverlay.top.line2}</span>
                    </h2>
                    <div className="w-12 h-1 bg-white/20 mt-6 mb-4 rounded-full"></div>
                    <p className="text-white/60 text-xs uppercase tracking-[0.3em] font-bold">
                        {content.experiencePage.mobileOverlay.top.subtitle}
                    </p>
                </div>

                {/* Mobile Bottom Overlay */}
                <div className="md:hidden absolute bottom-0 left-0 w-full pb-16 px-6 flex flex-col items-center justify-end pointer-events-none z-10">
                    <div className="grid grid-cols-3 gap-4 w-full mb-8 border-t border-white/10 pt-6">
                        {content.experiencePage.mobileOverlay.bottom.stats.map((stat, i) => (
                            <div key={i} className={cn("text-center", i > 0 && "border-l border-white/10")}>
                                <p className="text-white font-black text-xl italic">
                                    {stat.value}<span className="text-xs ml-1 not-italic text-white/50">{stat.unit}</span>
                                </p>
                                <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-white text-2xl uppercase tracking-tighter font-black mb-2 italic">
                        {content.experiencePage.mobileOverlay.bottom.heading}
                    </h3>
                    <p className="text-white/50 text-sm font-medium text-center max-w-[280px] leading-relaxed">
                        {content.experiencePage.mobileOverlay.bottom.description}
                    </p>
                </div>
            </div>

            {/* Minimal loading hint - only shows during initial critical frame load */}
            {!criticalFramesLoaded && (
                <div className="fixed bottom-8 right-8 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    <p className="font-mono text-xs text-white/80">Loading {loadingProgress}%</p>
                </div>
            )}
        </div>
    );
}

// Helper to fade text in/out based on scroll range (Adapted for ScooterScroll local progress 0-1)
function ScrollText({ children, start, end, align = "center", scrollYProgress }) {
    // Fade in at 'start', fade out at 'end'
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

    return (
        <motion.div
            style={{ opacity, y }}
            className={`absolute w-full px-8 top-1/2 -translate-y-1/2 ${align === 'center' ? 'text-center' :
                align === 'start' ? 'text-left' : 'text-right'
                }`}
        >
            {children}
        </motion.div>
    );
}
