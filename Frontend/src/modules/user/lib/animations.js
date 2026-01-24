/**
 * Reusable Framer Motion Variants for a Premium UI Experience
 */

export const fadeIn = (direction = 'up', delay = 0) => ({
    hidden: {
        y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
        x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        opacity: 0,
    },
    show: {
        y: 0,
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            duration: 1.25,
            delay: delay,
            ease: [0.25, 0.25, 0.25, 0.75],
        },
    },
});

export const staggerContainer = (staggerChildren, delayChildren) => ({
    hidden: {},
    show: {
        transition: {
            staggerChildren: staggerChildren,
            delayChildren: delayChildren || 0,
        },
    },
});

export const productCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
    hover: {
        y: -10,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

export const buttonClip = {
    initial: { clipPath: 'inset(0 0 0 0)' },
    hover: {
        clipPath: 'inset(0 100% 0 0)',
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
};

export const imageHover = {
    initial: { scale: 1 },
    hover: {
        scale: 1.1,
        transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
    },
};

export const glassHover = {
    initial: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    hover: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transition: { duration: 0.3 },
    },
};

export const scaleUp = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { type: 'spring', stiffness: 300 } },
};
