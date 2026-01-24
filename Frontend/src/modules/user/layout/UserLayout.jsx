import React from 'react';
import { Header, Footer } from './HeaderFooter';

export function UserLayout({ children }) {
    return (
        <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
