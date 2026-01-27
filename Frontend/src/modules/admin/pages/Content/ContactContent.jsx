import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../store/adminContentStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { Label } from '../../../user/components/ui/label';
import { Textarea } from '../../../user/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../user/components/ui/card';
import { Switch } from '../../../user/components/ui/switch';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export function ContactContent() {
    const { content, updatePageContent, fetchPageContent, loading } = useContentStore();
    const { toast } = useToast();
    const [contactData, setContactData] = useState(content.contactPage);

    useEffect(() => {
        const loadData = async () => {
            await fetchPageContent('contactPage');
        };
        loadData();
    }, [fetchPageContent]);

    // Sync local state when store content updates
    useEffect(() => {
        if (content.contactPage) {
            setContactData(content.contactPage);
        }
    }, [content.contactPage]);

    const handleSave = async () => {
        const result = await updatePageContent('contactPage', contactData);
        if (result?.success) {
            toast({
                title: 'Content Updated',
                description: 'Contact page content saved successfully!',
            });
        } else {
            toast({
                title: 'Update Failed',
                description: result?.error || 'Failed to save contact page content.',
                variant: 'destructive'
            });
        }
    };

    const handleReset = () => {
        setContactData(content.contactPage);
        toast({
            title: 'Changes Discarded',
            description: 'Contact page content reset to last saved state.',
            variant: 'destructive'
        });
    };

    const updateHeader = (field, value) => {
        setContactData(prev => ({
            ...prev,
            header: { ...prev.header, [field]: value }
        }));
    };

    const updateInfo = (field, value) => {
        setContactData(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [field]: value }
        }));
    };

    const updateHours = (field, value) => {
        setContactData(prev => ({
            ...prev,
            supportHours: { ...prev.supportHours, [field]: value }
        }));
    };

    const updateLabels = (field, value) => {
        setContactData(prev => ({
            ...prev,
            formLabels: { ...prev.formLabels, [field]: value }
        }));
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase">Contact Page Content</h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium italic">Manage contact info, support hours, and form labels</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none gap-2 text-xs md:text-sm h-10 md:h-11">
                        <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Discard
                    </Button>
                    <Button onClick={handleSave} className="flex-1 md:flex-none gap-2 text-xs md:text-sm h-10 md:h-11 font-bold tracking-wide" disabled={loading}>
                        {loading ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Header Section */}
                <Card className="border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Page Header</CardTitle>
                        <CardDescription className="text-xs md:text-sm">Main title and introductory text</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Header Title</Label>
                            <Input
                                value={contactData.header.title}
                                onChange={(e) => updateHeader('title', e.target.value)}
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Header Subtitle</Label>
                            <Textarea
                                value={contactData.header.subtitle}
                                onChange={(e) => updateHeader('subtitle', e.target.value)}
                                rows={3}
                                className="bg-secondary/5 border-secondary/20 text-xs md:text-sm min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Support Hours Card */}
                <Card className="border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Support Status</CardTitle>
                        <CardDescription className="text-xs md:text-sm">Live status and working hours</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between p-3 md:p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                            <div className="space-y-0.5">
                                <Label className="text-xs md:text-sm font-bold">Live Support Active</Label>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Toggles the pulse indicator on contact page</p>
                            </div>
                            <Switch
                                checked={contactData.supportHours.liveStatus}
                                onCheckedChange={(checked) => updateHours('liveStatus', checked)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Status Text</Label>
                            <Input
                                value={contactData.supportHours.liveText}
                                onChange={(e) => updateHours('liveText', e.target.value)}
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Working Hours Schedule</Label>
                            <Textarea
                                value={contactData.supportHours.schedule}
                                onChange={(e) => updateHours('schedule', e.target.value)}
                                rows={3}
                                placeholder="Monday — Friday: 9am — 6pm..."
                                className="bg-secondary/5 border-secondary/20 text-xs md:text-sm min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Contact Information</CardTitle>
                        <CardDescription className="text-xs md:text-sm">Direct contact channels</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Support Email</Label>
                            <Input
                                value={contactData.contactInfo.email}
                                onChange={(e) => updateInfo('email', e.target.value)}
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Support Phone</Label>
                            <Input
                                value={contactData.contactInfo.phone}
                                onChange={(e) => updateInfo('phone', e.target.value)}
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Studio Address</Label>
                            <Textarea
                                value={contactData.contactInfo.address}
                                onChange={(e) => updateInfo('address', e.target.value)}
                                rows={3}
                                className="bg-secondary/5 border-secondary/20 text-xs md:text-sm min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Labels */}
                <Card className="border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Form Configuration</CardTitle>
                        <CardDescription className="text-xs md:text-sm">Customize labels and placeholders</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Name Field Label</Label>
                            <Input
                                value={contactData.formLabels.nameLabel}
                                onChange={(e) => updateLabels('nameLabel', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Name Placeholder</Label>
                            <Input
                                value={contactData.formLabels.namePlaceholder}
                                onChange={(e) => updateLabels('namePlaceholder', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Field Label</Label>
                            <Input
                                value={contactData.formLabels.emailLabel}
                                onChange={(e) => updateLabels('emailLabel', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Placeholder</Label>
                            <Input
                                value={contactData.formLabels.emailPlaceholder}
                                onChange={(e) => updateLabels('emailPlaceholder', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Label</Label>
                            <Input
                                value={contactData.formLabels.messageLabel}
                                onChange={(e) => updateLabels('messageLabel', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Placeholder</Label>
                            <Input
                                value={contactData.formLabels.messagePlaceholder}
                                onChange={(e) => updateLabels('messagePlaceholder', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Submit Button Text</Label>
                            <Input
                                value={contactData.formLabels.submitText}
                                onChange={(e) => updateLabels('submitText', e.target.value)}
                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
