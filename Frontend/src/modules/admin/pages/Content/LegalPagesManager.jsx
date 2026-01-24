import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../store/adminContentStore';
import { Button } from '../../../user/components/ui/button';
import { Save, FileText, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function LegalPagesManager() {
    const { content, updatePageContent, fetchPageContent, loading } = useContentStore();
    const legalPages = content.legalPages || {};
    const [activeTab, setActiveTab] = useState('privacyPolicy');
    const [formData, setFormData] = useState({
        content: '',
        lastUpdated: ''
    });

    useEffect(() => {
        fetchPageContent('legalPages');
    }, []);

    useEffect(() => {
        if (legalPages && legalPages[activeTab]) {
            setFormData({
                content: legalPages[activeTab].content || '',
                lastUpdated: legalPages[activeTab].lastUpdated || ''
            });
        }
    }, [activeTab, legalPages]);

    const handleSave = async () => {
        const updatedLegalPages = {
            ...legalPages,
            [activeTab]: {
                ...legalPages[activeTab],
                content: formData.content,
                lastUpdated: formData.lastUpdated
            }
        };

        const result = await updatePageContent('legalPages', updatedLegalPages);
        if (result.success) {
            alert('Legal pages updated successfully!');
        } else {
            alert('Failed to update: ' + result.error);
        }
    };

    const tabs = [
        { id: 'privacyPolicy', label: 'Privacy Policy' },
        { id: 'termsOfService', label: 'Terms of Service' },
        { id: 'refundPolicy', label: 'Refund Policy' }
    ];

    return (
        <div className="p-8 space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Legal Pages</h1>
                    <p className="text-muted-foreground font-medium italic">Manage content for policies and terms</p>
                </div>
                <Button
                    onClick={handleSave}
                    premium
                    disabled={loading}
                    className="rounded-full font-black italic tracking-widest uppercase px-8 h-12 shadow-lg shadow-primary/20"
                >
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex gap-4 border-b border-border/50 pb-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2 rounded-full font-black italic uppercase tracking-wider text-sm transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-secondary/10 text-muted-foreground hover:bg-secondary/20"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-secondary/20 shadow-sm space-y-8">
                <div className="flex items-center gap-4 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wide">
                        Tip: You can use Markdown for formatting (## for headings, - for lists, **bold**, etc.)
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2 flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Last Updated Date
                        </label>
                        <input
                            type="text"
                            value={formData.lastUpdated}
                            onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                            className="w-full bg-secondary/5 border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                            placeholder="e.g. January 20, 2026"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2 flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Content (Markdown)
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-[500px] bg-secondary/5 border border-secondary/20 rounded-xl px-6 py-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm leading-relaxed resize-none"
                            placeholder="Enter policy content..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
