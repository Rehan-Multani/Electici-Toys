import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useContentStore } from '../../admin/store/adminContentStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { staggerContainer, fadeIn } from '../lib/animations';
import api from '../../../lib/axios';
import { useToast } from '../components/Toast';

export function Contact() {
    const { content, fetchPageContent } = useContentStore();
    const { contactPage } = content;
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPageContent('contactPage');
    }, [fetchPageContent]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "Incomplete Form",
                description: "Please fill in all fields before sending.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/contact/submit', formData);
            if (response.data.success) {
                toast({
                    title: "Transmission Sent",
                    description: response.data.message,
                });
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error(response.data.message || "Failed to send transmission");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            toast({
                title: "Transmission Failed",
                description: error.response?.data?.message || "There was an error sending your message. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const THEME_COLOR = '#C78023'; // Ochre

    return (
        <motion.div
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 pt-20 pb-0"
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column: Header + Contact Info */}
                    <motion.div
                        variants={staggerContainer(0.1, 0.3)}
                        className="space-y-12"
                    >
                        {/* Header Section */}
                        <header className="text-center md:text-left overflow-hidden pt-2 pl-1">
                            <motion.h1
                                variants={{
                                    hidden: { x: -100, opacity: 0 },
                                    show: {
                                        x: 0,
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 120, damping: 20, mass: 1 }
                                    }
                                }}
                                className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] mb-4 drop-shadow-xl"
                                style={{ color: THEME_COLOR }}
                            >
                                {contactPage.header.title}
                            </motion.h1>
                            <motion.p
                                variants={{
                                    hidden: { x: -100, opacity: 0 },
                                    show: {
                                        x: 0,
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 120, damping: 20, mass: 1, delay: 0.1 }
                                    }
                                }}
                                className="text-lg md:text-2xl font-bold italic text-muted-foreground uppercase max-w-2xl leading-tight opacity-80"
                            >
                                {contactPage.header.subtitle}
                            </motion.p>
                        </header>

                        {/* Contact Details */}
                        <div className="space-y-8">
                            {[
                                { icon: Mail, title: "EMAIL US", value: contactPage.contactInfo.email },
                                { icon: Phone, title: "CALL US", value: contactPage.contactInfo.phone },
                                { icon: MapPin, title: "VISIT STUDIO", value: contactPage.contactInfo.address }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeIn('right')}
                                    className="flex gap-6 items-center group"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="w-14 h-14 rounded-2xl bg-secondary/30 dark:bg-secondary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:text-white group-hover:shadow-lg"
                                        style={{ color: THEME_COLOR }}
                                    // Dynamic style for hover bg is tricky inline, so we rely on group-hover with Tailwind arbitrary value for bg
                                    >
                                        <div className="group-hover:hidden">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="hidden group-hover:block text-white z-10">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        {/* Hover Background Layer */}
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" style={{ backgroundColor: THEME_COLOR }} />
                                    </motion.div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-lg font-black italic tracking-tighter uppercase leading-none text-foreground">{item.title}</h3>
                                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                            {item.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Support Hours Card */}
                        <motion.div
                            variants={fadeIn('up')}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl relative overflow-hidden group"
                            style={{ backgroundColor: THEME_COLOR, boxShadow: `0 20px 40px -10px ${THEME_COLOR}50` }} // Adding hex alpha for shadow
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-all" />
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Support Hours</h4>
                            <p className="text-xs uppercase font-bold tracking-widest opacity-90 whitespace-pre-line leading-relaxed">
                                {contactPage.supportHours.schedule}
                            </p>
                            <div className="pt-4 flex gap-3 items-center">
                                <div className={`w-2.5 h-2.5 rounded-full ${contactPage.supportHours.liveStatus ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-muted'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{contactPage.supportHours.liveText}</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Form Section - Right Column */}
                    <motion.div variants={fadeIn('left')} className="lg:col-span-1">
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden transition-colors duration-300 h-full">
                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-20" style={{ backgroundColor: THEME_COLOR }} />

                            <div className="mb-8 text-center md:text-left relative z-10">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground mb-1">Start a Co-op</h3>
                                <p className="text-muted-foreground font-medium text-sm">Ready to play? Send us a transmission.</p>
                            </div>

                            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest ml-3 group-focus-within:text-foreground transition-colors" style={{ color: THEME_COLOR }}>
                                                {contactPage.formLabels.nameLabel}
                                            </label>
                                            <Input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="bg-background/50 border-input h-12 rounded-2xl px-5 font-bold text-foreground placeholder:text-muted-foreground/30 focus:bg-background focus:ring-2 transition-all text-sm"
                                                style={{ '--ring-color': `${THEME_COLOR}30` }} // Custom property for focus ring if needed, or just class
                                                placeholder={contactPage.formLabels.namePlaceholder}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest ml-3 group-focus-within:text-foreground transition-colors" style={{ color: THEME_COLOR }}>
                                                {contactPage.formLabels.emailLabel}
                                            </label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="bg-background/50 border-input h-12 rounded-2xl px-5 font-bold text-foreground placeholder:text-muted-foreground/30 focus:bg-background focus:ring-2 transition-all text-sm"
                                                placeholder={contactPage.formLabels.emailPlaceholder}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 group">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-3 group-focus-within:text-foreground transition-colors" style={{ color: THEME_COLOR }}>
                                            {contactPage.formLabels.messageLabel}
                                        </label>
                                        <Textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="bg-background/50 border-input rounded-2xl p-5 font-bold text-foreground placeholder:text-muted-foreground/30 resize-none focus:bg-background focus:ring-2 transition-all text-sm"
                                            placeholder={contactPage.formLabels.messagePlaceholder}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-full text-lg font-black italic uppercase tracking-widest text-white shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group"
                                        style={{ backgroundColor: THEME_COLOR, boxShadow: `0 10px 25px -5px ${THEME_COLOR}40` }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="mr-2">{contactPage.formLabels.submitText}</span>
                                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Video Section */}
                <div className="mt-20 w-full flex justify-center mb-0">
                    <div className="w-full max-w-[150px] relative">
                        <video
                            src="/assets/footer video/video4.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto object-contain block mix-blend-multiply dark:mix-blend-screen"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
