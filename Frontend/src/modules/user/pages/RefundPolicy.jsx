import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContentStore } from '../../admin/store/adminContentStore';

const RefundPolicy = () => {
    const { content, fetchPageContent } = useContentStore();
    const { refundPolicy } = content.legalPages || {};

    useEffect(() => {
        fetchPageContent('legalPages');
    }, []);

    const data = refundPolicy || {
        title: 'Refund Policy',
        lastUpdated: 'January 2026',
        content: ''
    };

    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-black italic uppercase tracking-tighter mb-4 mt-8">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('- ')) {
                return <li key={i} className="ml-6 mb-2 list-disc pl-2 marker:text-primary">{line.replace('- ', '')}</li>;
            }
            if (line.trim() === '') return <div key={i} className="h-4" />;
            return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-24 pb-40 max-w-4xl"
        >
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-primary mb-4">{data.title}</h1>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm md:text-base">Last Updated: {data.lastUpdated}</p>
            </div>

            <div className="text-foreground/80 font-medium leading-relaxed">
                {renderContent(data.content)}
            </div>
        </motion.div>
    );
};

export default RefundPolicy;
