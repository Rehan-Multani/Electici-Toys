import React, { useState } from 'react';
import { useContentStore } from '../../store/adminContentStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { Label } from '../../../user/components/ui/label';
import { Textarea } from '../../../user/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../user/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../user/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../user/components/ui/select';
import { Plus, Trash2, Save, RotateCcw, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export function ExperienceContent() {
    const { content, updatePageContent } = useContentStore();
    const { toast } = useToast();
    const [expData, setExpData] = useState(content.experiencePage);

    const handleSave = () => {
        updatePageContent('experiencePage', expData);
        toast({
            title: 'Content Updated',
            description: 'Experience page content saved successfully!',
        });
    };

    const handleReset = () => {
        setExpData(content.experiencePage);
        toast({
            title: 'Changes Discarded',
            description: 'Experience content reset to last saved state.',
            variant: 'destructive'
        });
    };

    const updateScrollItem = (type, index, field, value) => {
        const key = type === 'mobile' ? 'mobileScrolls' : 'desktopScrolls';
        setExpData(prev => ({
            ...prev,
            [key]: prev[key].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addScrollItem = (type) => {
        const key = type === 'mobile' ? 'mobileScrolls' : 'desktopScrolls';
        const newItem = {
            id: Date.now(),
            start: 0,
            end: 0.1,
            align: 'center',
            heading: 'NEW SEGMENT',
            description: ''
        };
        setExpData(prev => ({ ...prev, [key]: [...prev[key], newItem] }));
    };

    const removeScrollItem = (type, index) => {
        const key = type === 'mobile' ? 'mobileScrolls' : 'desktopScrolls';
        setExpData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    };

    const updateFooter = (field, value) => {
        setExpData(prev => ({
            ...prev,
            footer: { ...prev.footer, [field]: value }
        }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Experience Content</h1>
                    <p className="text-muted-foreground mt-2">Manage scrollytelling overlays and footer branding</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Discard
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="mobile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="mobile" className="gap-2"><Smartphone className="h-4 w-4" /> Mobile Scroll</TabsTrigger>
                    <TabsTrigger value="desktop" className="gap-2"><Monitor className="h-4 w-4" /> Desktop Scroll</TabsTrigger>
                    <TabsTrigger value="footer">Footer & Branding</TabsTrigger>
                </TabsList>

                {/* Mobile Scroll Tab */}
                <TabsContent value="mobile" className="space-y-4">
                    <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-xl border border-dashed text-sm font-medium text-muted-foreground">
                        <p>💡 Tip: For mobile, keep "end" values below 0.7 to avoid footer overlap.</p>
                        <Button onClick={() => addScrollItem('mobile')} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Mobile Segment
                        </Button>
                    </div>
                    <ScrollList
                        items={expData.mobileScrolls}
                        onChange={(idx, f, v) => updateScrollItem('mobile', idx, f, v)}
                        onRemove={(idx) => removeScrollItem('mobile', idx)}
                    />
                </TabsContent>

                {/* Desktop Scroll Tab */}
                <TabsContent value="desktop" className="space-y-4">
                    <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-xl border border-dashed text-sm font-medium text-muted-foreground">
                        <p>💡 Tip: Use "start" and "end" alignment for dynamic motion across the screen.</p>
                        <Button onClick={() => addScrollItem('desktop')} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Desktop Segment
                        </Button>
                    </div>
                    <ScrollList
                        items={expData.desktopScrolls}
                        onChange={(idx, f, v) => updateScrollItem('desktop', idx, f, v)}
                        onRemove={(idx) => removeScrollItem('desktop', idx)}
                    />
                </TabsContent>

                {/* Footer Tab */}
                <TabsContent value="footer" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Experience Footer</CardTitle>
                            <CardDescription>Final section content after scrollytelling</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Small Tagline</Label>
                                    <Input
                                        value={expData.footer.tagline}
                                        onChange={(e) => updateFooter('tagline', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Main Heading</Label>
                                    <Input
                                        value={expData.footer.heading}
                                        onChange={(e) => updateFooter('heading', e.target.value)}
                                        placeholder="READY TO\nPLAY?"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Use \n for line breaks</p>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Copyright Text</Label>
                                    <Input
                                        value={expData.footer.copyright}
                                        onChange={(e) => updateFooter('copyright', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mobile Branding Overlay</CardTitle>
                            <CardDescription>Stats and logos shown on mobile scrollytelling</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Top Header Line 1</Label>
                                    <Input
                                        value={expData.mobileOverlay.top.line1}
                                        onChange={(e) => setExpData(prev => ({
                                            ...prev,
                                            mobileOverlay: { ...prev.mobileOverlay, top: { ...prev.mobileOverlay.top, line1: e.target.value } }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Top Header Line 2</Label>
                                    <Input
                                        value={expData.mobileOverlay.top.line2}
                                        onChange={(e) => setExpData(prev => ({
                                            ...prev,
                                            mobileOverlay: { ...prev.mobileOverlay, top: { ...prev.mobileOverlay.top, line2: e.target.value } }
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Bottom Slogan</Label>
                                <Input
                                    value={expData.mobileOverlay.bottom.heading}
                                    onChange={(e) => setExpData(prev => ({
                                        ...prev,
                                        mobileOverlay: { ...prev.mobileOverlay, bottom: { ...prev.mobileOverlay.bottom, heading: e.target.value } }
                                    }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ScrollList({ items, onChange, onRemove }) {
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <Card key={item.id}>
                    <CardHeader className="py-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-bold">Segment {index + 1}: {item.heading}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => onRemove(index)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pb-6">
                        <div className="space-y-2">
                            <Label>Heading</Label>
                            <Input
                                value={item.heading}
                                onChange={(e) => onChange(index, 'heading', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Alignment</Label>
                            <Select value={item.align} onValueChange={(v) => onChange(index, 'align', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Alignment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="start">Start (Left)</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="end">End (Right)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Progress (0-1)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={item.start}
                                onChange={(e) => onChange(index, 'start', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Progress (0-1)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={item.end}
                                onChange={(e) => onChange(index, 'end', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-4 space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input
                                value={item.description}
                                onChange={(e) => onChange(index, 'description', e.target.value)}
                                placeholder="Sub-text or instruction"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
