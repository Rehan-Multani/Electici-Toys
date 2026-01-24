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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Contact Page Content</h1>
                    <p className="text-muted-foreground mt-2">Manage contact info, support hours, and form labels</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} className="gap-2" disabled={loading}>
                        <RotateCcw className="h-4 w-4" />
                        Discard
                    </Button>
                    <Button onClick={handleSave} className="gap-2" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Header Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Page Header</CardTitle>
                        <CardDescription>Main title and introductory text</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Header Title</Label>
                            <Input
                                value={contactData.header.title}
                                onChange={(e) => updateHeader('title', e.target.value)}
                                className="font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Header Subtitle</Label>
                            <Textarea
                                value={contactData.header.subtitle}
                                onChange={(e) => updateHeader('subtitle', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Support Hours Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Support Status</CardTitle>
                        <CardDescription>Live status and working hours</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold">Live Support Active</Label>
                                <p className="text-xs text-muted-foreground">Toggles the pulse indicator on contact page</p>
                            </div>
                            <Switch
                                checked={contactData.supportHours.liveStatus}
                                onCheckedChange={(checked) => updateHours('liveStatus', checked)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status Text</Label>
                            <Input
                                value={contactData.supportHours.liveText}
                                onChange={(e) => updateHours('liveText', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Working Hours Schedule</Label>
                            <Textarea
                                value={contactData.supportHours.schedule}
                                onChange={(e) => updateHours('schedule', e.target.value)}
                                rows={3}
                                placeholder="Monday — Friday: 9am — 6pm..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Direct contact channels</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input
                                value={contactData.contactInfo.email}
                                onChange={(e) => updateInfo('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Phone</Label>
                            <Input
                                value={contactData.contactInfo.phone}
                                onChange={(e) => updateInfo('phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Studio Address</Label>
                            <Textarea
                                value={contactData.contactInfo.address}
                                onChange={(e) => updateInfo('address', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Labels */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Configuration</CardTitle>
                        <CardDescription>Customize labels and placeholders</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name Field Label</Label>
                            <Input
                                value={contactData.formLabels.nameLabel}
                                onChange={(e) => updateLabels('nameLabel', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Name Placeholder</Label>
                            <Input
                                value={contactData.formLabels.namePlaceholder}
                                onChange={(e) => updateLabels('namePlaceholder', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Field Label</Label>
                            <Input
                                value={contactData.formLabels.emailLabel}
                                onChange={(e) => updateLabels('emailLabel', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Placeholder</Label>
                            <Input
                                value={contactData.formLabels.emailPlaceholder}
                                onChange={(e) => updateLabels('emailPlaceholder', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Message Label</Label>
                            <Input
                                value={contactData.formLabels.messageLabel}
                                onChange={(e) => updateLabels('messageLabel', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Message Placeholder</Label>
                            <Input
                                value={contactData.formLabels.messagePlaceholder}
                                onChange={(e) => updateLabels('messagePlaceholder', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Submit Button Text</Label>
                            <Input
                                value={contactData.formLabels.submitText}
                                onChange={(e) => updateLabels('submitText', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
