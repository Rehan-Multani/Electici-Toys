import React from 'react';
import { motion } from 'framer-motion';

const AnimatedFeature = ({ icon: Icon, delay, className }) => {
    return (
        <motion.div
            className={`flex items-center justify-center ${className || ''}`}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: 0.5, type: "spring" }}
            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.2 }}
        >
            <Icon className="w-8 h-8 text-gray-900 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
        </motion.div>
    );
};

export default AnimatedFeature;
