import React from 'react';

const images = [
    "Ha1214f3bb2bb47c0b55e98d0143b90455.jpg_720x720q50 - Copy.jpg",
    "Ha1214f3bb2bb47c0b55e98d0143b90455.jpg_720x720q50.jpg",
    "WhatsApp Image 2026-01-10 at 16.10.54 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.54.jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.55.jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.58 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.58 (2).jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.58.jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.59 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.10.59.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.00.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.03.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.05 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.05.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.06 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.06.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.07.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.08 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.08.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.09.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.14 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.14.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.15 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.15.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.16.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.17.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.18.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.19.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.21.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.22.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.23 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.23.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.24.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.27.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.28 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.28.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.29.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.30.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.32.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.33 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.33.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.34 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.34.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.36.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.37 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.37.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.38 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.38.jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.39 (1).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.39 (2).jpeg",
    "WhatsApp Image 2026-01-10 at 16.11.39.jpeg"
];

export function Gallery() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Asset Gallery</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                    <div key={i} className="border p-2 rounded">
                        <img src={`/assets/products/${img}`} alt={img} className="w-full h-48 object-cover mb-2" />
                        <p className="text-xs break-all">{img}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
