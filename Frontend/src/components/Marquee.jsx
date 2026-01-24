import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Marquee = () => {
    const textRef = useRef(null);

    useEffect(() => {
        const textElement = textRef.current;

        const tl = gsap.to(textElement, {
            xPercent: -50,
            ease: "none",
            duration: 20, // Faster speed
            repeat: -1,
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="overflow-hidden py-1 relative z-40 bg-[#0096FF]"> {/* Bright Blue background */}
            <div className="whitespace-nowrap flex items-center" ref={textRef}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center mx-0">
                        <span className="text-white text-xs md:text-sm font-bold tracking-wide uppercase px-8">
                            ⚡ Winter Sale: Up to 50% Off Selected Scooters! • Free Shipping on orders over ₹500
                        </span>
                        {/* No separator dots, just continuous text as per reference style usually */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marquee;
