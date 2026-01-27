import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../store/adminContentStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { Label } from '../../../user/components/ui/label';
import { Textarea } from '../../../user/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../user/components/ui/card';
import { Plus, Trash2, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export function AboutContent() {
    const { content, updatePageContent, fetchPageContent, loading } = useContentStore();
    const { toast } = useToast();
    const [aboutData, setAboutData] = useState(content.aboutPage);

    useEffect(() => {
        const loadData = async () => {
            await fetchPageContent('aboutPage');
        };
        loadData();
    }, [fetchPageContent]);

    // Sync local state when store content updates (e.g., after fetch)
    useEffect(() => {
        if (content.aboutPage) {
            setAboutData({
                ...content.aboutPage,
                images: content.aboutPage.images || []
            });
        }
    }, [content.aboutPage]);

    const handleSave = async () => {
        const result = await updatePageContent('aboutPage', aboutData);
        if (result?.success) {
            toast({
                title: 'Content Updated',
                description: 'About page content saved successfully!',
            });
        } else {
            toast({
                title: 'Update Failed',
                description: result?.error || 'Failed to save about page content.',
                variant: 'destructive'
            });
        }
    };

    const handleReset = () => {
        setAboutData(content.aboutPage);
        toast({
            title: 'Changes Discarded',
            description: 'About page content reset to last saved state.',
            variant: 'destructive'
        });
    };

    const updateHero = (field, value) => {
        setAboutData(prev => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    const updateImage = (index, value) => {
        const newImages = [...aboutData.images];
        newImages[index] = value;
        setAboutData(prev => ({ ...prev, images: newImages }));
    };

    const addImage = () => {
        setAboutData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImage = (index) => {
        setAboutData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const updateValue = (index, field, value) => {
        setAboutData(prev => ({
            ...prev,
            values: prev.values.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeValue = (index) => {
        setAboutData(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const addValue = () => {
        setAboutData(prev => ({
            ...prev,
            values: [...prev.values, {
                id: Date.now(),
                icon: 'Zap',
                title: 'NEW VALUE',
                description: 'Add description'
            }]
        }));
    };

    const updateContent = (field, value) => {
        setAboutData(prev => ({
            ...prev,
            content: { ...prev.content, [field]: value }
        }));
    };

    const updateParagraph = (index, value) => {
        const newParagraphs = [...aboutData.content.paragraphs];
        newParagraphs[index] = value;
        updateContent('paragraphs', newParagraphs);
    };

    const addParagraph = () => {
        updateContent('paragraphs', [...aboutData.content.paragraphs, '']);
    };

    const removeParagraph = (index) => {
        updateContent('paragraphs', aboutData.content.paragraphs.filter((_, i) => i !== index));
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase">About Page Content</h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium italic">Manage mission, core values, and company story</p>
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
                {/* Hero / Mission Section */}
                <Card className="h-fit border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Mission Section</CardTitle>
                        <CardDescription className="text-xs md:text-sm">The big heading and main mission statement</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Hero Heading</Label>
                            <Input
                                value={aboutData.hero.heading}
                                onChange={(e) => updateHero('heading', e.target.value)}
                                placeholder="OUR MISSION"
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mission Statement</Label>
                            <Textarea
                                value={aboutData.hero.mission}
                                onChange={(e) => updateHero('mission', e.target.value)}
                                rows={5}
                                placeholder="We started ELECTRICI TOYS-HUB..."
                                className="bg-secondary/5 border-secondary/20 text-xs md:text-sm min-h-[100px] md:min-h-[120px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Gallery Images Section */}
                <Card className="h-fit border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Gallery Images</CardTitle>
                                <CardDescription className="text-xs md:text-sm">Images displayed in the top section grid</CardDescription>
                            </div>
                            <Button onClick={addImage} variant="outline" size="sm" className="h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full gap-2">
                                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> Add Image
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        {aboutData.images && aboutData.images.map((img, i) => (
                            <div key={i} className="flex gap-3 md:gap-4 items-start bg-secondary/5 p-3 md:p-4 rounded-xl border border-secondary/20">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Image URL {i + 1}</Label>
                                    <Input
                                        value={img}
                                        onChange={(e) => updateImage(i, e.target.value)}
                                        placeholder="/assets/products/image.jpg"
                                        className="h-9 md:h-10 bg-white border-secondary/20 text-xs md:text-sm"
                                    />
                                    {img && (
                                        <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-secondary/20 bg-white flex items-center justify-center relative">
                                            <img
                                                src={img}
                                                alt={`Preview ${i + 1}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => e.target.src = 'https://placehold.co/400x300?text=Invalid+URL'}
                                            />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImage(i)}
                                    className="text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 mt-6 rounded-full"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {(!aboutData.images || aboutData.images.length === 0) && (
                            <div className="text-center py-6 md:py-8 border-2 border-dashed border-secondary/20 rounded-xl text-muted-foreground text-xs md:text-sm italic">
                                No images added. Click 'Add Image' to begin.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Company Story / Content Section */}
                <Card className="h-fit border-secondary/20 shadow-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Company Story</CardTitle>
                        <CardDescription className="text-xs md:text-sm">Detailed history and philosophy sections</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Content Heading</Label>
                            <Input
                                value={aboutData.content.heading}
                                onChange={(e) => updateContent('heading', e.target.value)}
                                placeholder="ENGINEERED FOR THRILLS"
                                className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Story Paragraphs</Label>
                                <Button onClick={addParagraph} variant="outline" size="sm" className="h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full gap-2">
                                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> Add
                                </Button>
                            </div>
                            {aboutData.content.paragraphs.map((p, i) => (
                                <div key={i} className="flex gap-3">
                                    <Textarea
                                        value={p}
                                        onChange={(e) => updateParagraph(i, e.target.value)}
                                        rows={3}
                                        className="bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeParagraph(i)}
                                        className="text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-full flex-shrink-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Visual Emoji</Label>
                            <Input
                                value={aboutData.content.emoji}
                                onChange={(e) => updateContent('emoji', e.target.value)}
                                className="text-2xl md:text-3xl w-16 h-16 md:w-20 md:h-20 text-center rounded-2xl bg-secondary/5 border-secondary/20"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Values Section */}
            <Card className="border-secondary/20 shadow-sm">
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Core Values</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Grid of 4 values with icons</CardDescription>
                        </div>
                        <Button onClick={addValue} size="sm" className="h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full gap-2">
                            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Add Value
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aboutData.values.map((v, i) => (
                        <div key={v.id} className="p-4 rounded-2xl border border-secondary/20 bg-secondary/5 space-y-3 relative group hover:shadow-lg transition-all duration-300">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeValue(i)}
                                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Lucide Icon</Label>
                                <Input
                                    value={v.icon}
                                    onChange={(e) => updateValue(i, 'icon', e.target.value)}
                                    placeholder="Zap"
                                    className="h-8 text-xs bg-white border-secondary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                                <Input
                                    value={v.title}
                                    onChange={(e) => updateValue(i, 'title', e.target.value)}
                                    placeholder="INNOVATION"
                                    className="h-8 font-bold text-xs bg-white border-secondary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                                <Textarea
                                    value={v.description}
                                    onChange={(e) => updateValue(i, 'description', e.target.value)}
                                    placeholder="Add description..."
                                    className="text-xs h-20 bg-white border-secondary/20 resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
