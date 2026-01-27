import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../store/adminContentStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { Label } from '../../../user/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../user/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../user/components/ui/card';
import { Plus, Trash2, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export function HomeContent() {
    const { content, fetchPageContent, updatePageContent, fetchBackendCategories, loading } = useContentStore();
    const { toast } = useToast();
    const [homeData, setHomeData] = useState(content.homePage);
    const [testimonials, setTestimonials] = useState(content.testimonials || []);
    const [backendCategories, setBackendCategories] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsInitialLoading(true);
            await fetchPageContent('homePage');
            const cats = await fetchBackendCategories();
            setBackendCategories(cats);
            setIsInitialLoading(false);
        };
        loadData();
    }, []);

    // Update local state when store content changes (after fetch)
    useEffect(() => {
        if (content.homePage) {
            // Ensure hero data is consistent when loading from store
            const hero = { ...content.homePage.hero };
            if (hero.image && (!hero.images || hero.images.length <= 1)) {
                hero.images = [hero.image];
            } else if (!hero.image && hero.images && hero.images.length > 0) {
                hero.image = hero.images[0];
            }

            setHomeData({
                ...content.homePage,
                hero
            });
        }
        setTestimonials(content.testimonials || []);
    }, [content.homePage, content.testimonials]);

    const handleSave = async () => {
        // Force fixed CTA links before saving
        const dataToSave = {
            ...homeData,
            hero: {
                ...homeData.hero,
                ctaLink: '/products'
            },
            featuredSection: {
                ...homeData.featuredSection,
                ctaLink: '/products'
            }
        };

        console.log("Saving Home Page Data:", dataToSave);

        const result = await updatePageContent('homePage', dataToSave);

        // Also save testimonials if they were modified
        if (testimonials.length > 0) {
            await updatePageContent('testimonials', testimonials);
        }

        if (result.success) {
            toast({
                title: 'Changes saved',
                description: 'Home page content has been updated successfully.'
            });
        } else {
            toast({
                title: 'Update Failed',
                description: result.error || 'Failed to save content.',
                variant: 'destructive'
            });
        }
    };

    const handleReset = () => {
        setHomeData(content.homePage);
        setTestimonials(content.testimonials || []);
        toast({
            title: 'Changes Discarded',
            description: 'Home page content reset to last saved state.',
            variant: 'destructive'
        });
    };

    const updateHero = (field, value) => {
        setHomeData(prev => {
            const updatedHero = { ...prev.hero, [field]: value };
            // If image is updated, also update images array for compatibility
            if (field === 'image') {
                updatedHero.images = [value];
            }
            return {
                ...prev,
                hero: updatedHero
            };
        });
    };

    const updateTrustMarker = (index, field, value) => {
        setHomeData(prev => ({
            ...prev,
            trustMarkers: prev.trustMarkers.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeTrustMarker = (index) => {
        setHomeData(prev => ({
            ...prev,
            trustMarkers: prev.trustMarkers.filter((_, i) => i !== index)
        }));
    };

    const addTrustMarker = () => {
        setHomeData(prev => ({
            ...prev,
            trustMarkers: [...prev.trustMarkers, {
                id: Date.now(),
                icon: 'Shield',
                title: 'NEW FEATURE',
                description: 'Add description'
            }]
        }));
    };

    const updateCategory = (index, field, value) => {
        setHomeData(prev => ({
            ...prev,
            categories: prev.categories.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeCategory = (index) => {
        setHomeData(prev => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
    };

    const addCategory = () => {
        if (backendCategories.length === 0) {
            toast({
                title: 'No Categories Found',
                description: 'Please create categories in the Category Manager first.',
                variant: 'destructive'
            });
            return;
        }

        // Default to first backend category
        const firstCat = backendCategories[0];
        setHomeData(prev => ({
            ...prev,
            categories: [...prev.categories, {
                id: Date.now(),
                backendId: firstCat._id,
                name: firstCat.categoryName,
                title: firstCat.categoryName.split(' ').join('\n'),
                description: firstCat.description || 'Add description here',
                image: firstCat.image || '/placeholder.jpg',
                ctaText: 'EXPLORE',
                ctaLink: `/products?category=${firstCat.categoryName.toLowerCase()}`,
                bgColor: 'primary/10',
                borderColor: 'primary/30'
            }]
        }));
    };

    const updateTestimonial = (index, field, value) => {
        const newTestimonials = testimonials.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setTestimonials(newTestimonials);
        setHomeData(prev => ({ ...prev, testimonials: newTestimonials }));
    };

    const addTestimonial = () => {
        const newTestimonial = {
            id: Date.now(),
            name: 'New Customer',
            image: 'https://randomuser.me/api/portraits/men/1.jpg',
            rating: 5,
            text: 'Amazing products!',
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' })
        };
        const newTestimonials = [...testimonials, newTestimonial];
        setTestimonials(newTestimonials);
        setHomeData(prev => ({ ...prev, testimonials: newTestimonials }));
    };

    const removeTestimonial = (index) => {
        const newTestimonials = testimonials.filter((_, i) => i !== index);
        setTestimonials(newTestimonials);
        setHomeData(prev => ({ ...prev, testimonials: newTestimonials }));
    };

    if (isInitialLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto relative pb-20">
            {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase">Home Page Content</h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium italic">Manage hero section, trust markers, categories, and testimonials</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none gap-2 text-xs md:text-sm h-10 md:h-11" disabled={loading}>
                        <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Discard
                    </Button>
                    <Button onClick={handleSave} className="flex-1 md:flex-none gap-2 text-xs md:text-sm h-10 md:h-11 font-bold tracking-wide" disabled={loading}>
                        {loading ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="hero" className="space-y-4 md:space-y-6">
                <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-xl flex flex-wrap md:grid md:grid-cols-5 gap-1">
                    <TabsTrigger value="hero" className="flex-1 text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-2.5">Hero</TabsTrigger>
                    <TabsTrigger value="trust" className="flex-1 text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-2.5">Trust</TabsTrigger>
                    <TabsTrigger value="categories" className="flex-1 text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-2.5">Categories</TabsTrigger>
                    <TabsTrigger value="testimonials" className="flex-1 text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-2.5">Testimonials</TabsTrigger>
                    <TabsTrigger value="offers" className="flex-1 text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-2.5">Offers</TabsTrigger>
                </TabsList>

                {/* Hero Section Tab */}
                <TabsContent value="hero" className="space-y-4">
                    <Card className="border-secondary/20 shadow-sm">
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Hero Section</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Main banner content and call-to-action</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Background Image URL</Label>
                                <Input
                                    value={homeData.hero.image || (homeData.hero.images && homeData.hero.images[0]) || ''}
                                    onChange={(e) => updateHero('image', e.target.value)}
                                    placeholder="/hero.png"
                                    className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                />
                                <p className="text-[9px] md:text-[10px] text-muted-foreground ml-1">Recommended size: 1920x1080px</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Main Heading</Label>
                                <Input
                                    value={homeData.hero.heading}
                                    onChange={(e) => updateHero('heading', e.target.value)}
                                    placeholder="UNLEASH THE POWER OF PLAY"
                                    className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Button Text</Label>
                                    <Input
                                        value={homeData.hero.ctaText}
                                        onChange={(e) => updateHero('ctaText', e.target.value)}
                                        placeholder="SHOP COLLECTION"
                                        className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Link</Label>
                                    <Input
                                        value="/products"
                                        disabled
                                        className="h-10 md:h-12 bg-secondary/20 border-secondary/20 text-xs md:text-sm font-medium text-muted-foreground"
                                    />
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground italic ml-1">Fixed to product collection page.</p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-4 md:mt-6 p-4 md:p-6 bg-secondary/10 rounded-xl border-2 border-dashed border-secondary/30">
                                <p className="text-[10px] md:text-xs text-muted-foreground mb-3 uppercase font-bold tracking-widest">Preview</p>
                                <div className="space-y-3">
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">{homeData.hero.heading}</h2>
                                    <Button className="rounded-full font-black italic h-10 px-6 text-xs md:text-sm">{homeData.hero.ctaText}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-secondary/20 shadow-sm">
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Featured Section</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Title and subtitle for products showcase</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Section Title</Label>
                                <Input
                                    value={homeData.featuredSection.title}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        featuredSection: { ...prev.featuredSection, title: e.target.value }
                                    }))}
                                    placeholder="THE HIT LIST"
                                    className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Section Subtitle</Label>
                                <Input
                                    value={homeData.featuredSection.subtitle}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        featuredSection: { ...prev.featuredSection, subtitle: e.target.value }
                                    }))}
                                    placeholder="Our most-wanted electric wonders."
                                    className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Text</Label>
                                    <Input
                                        value={homeData.featuredSection.ctaText}
                                        onChange={(e) => setHomeData(prev => ({
                                            ...prev,
                                            featuredSection: { ...prev.featuredSection, ctaText: e.target.value }
                                        }))}
                                        placeholder="All Products"
                                        className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Link</Label>
                                    <Input
                                        value="/products"
                                        disabled
                                        className="h-10 md:h-12 bg-secondary/20 border-secondary/20 text-xs md:text-sm font-medium text-muted-foreground"
                                    />
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground italic ml-1">Fixed to product collection page.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trust Markers Tab */}
                <TabsContent value="trust" className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Manage trust markers (warranty, shipping, etc.)</p>
                        <Button onClick={addTrustMarker} size="sm" className="gap-2 h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
                            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Add Marker
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {homeData.trustMarkers.map((marker, index) => (
                            <Card key={marker.id} className="border-secondary/20 shadow-sm relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTrustMarker(index)}
                                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm md:text-base font-bold uppercase tracking-tight">Marker {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Icon Name (Lucide)</Label>
                                        <Input
                                            value={marker.icon}
                                            onChange={(e) => updateTrustMarker(index, 'icon', e.target.value)}
                                            placeholder="Shield"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                        <p className="text-[9px] md:text-[10px] text-muted-foreground ml-1">
                                            Use: Shield, Truck, CreditCard, RotateCcw, etc.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                                        <Input
                                            value={marker.title}
                                            onChange={(e) => updateTrustMarker(index, 'title', e.target.value)}
                                            placeholder="1-YEAR WARRANTY"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                                        <Input
                                            value={marker.description}
                                            onChange={(e) => updateTrustMarker(index, 'description', e.target.value)}
                                            placeholder="Full peace of mind"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Manage featured category cards</p>
                        <Button onClick={addCategory} size="sm" className="gap-2 h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
                            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Add Category
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {homeData.categories.map((category, index) => (
                            <Card key={category.id} className="border-secondary/20 shadow-sm relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCategory(index)}
                                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm md:text-base font-bold uppercase tracking-tight">{category.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3">
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Link to Backend Category</Label>
                                        <select
                                            className="w-full flex h-9 md:h-10 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2 text-xs md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={category.backendId}
                                            onChange={(e) => {
                                                const selectedCat = backendCategories.find(c => c._id === e.target.value);
                                                if (selectedCat) {
                                                    updateCategory(index, 'backendId', selectedCat._id);
                                                    updateCategory(index, 'name', selectedCat.categoryName);
                                                    updateCategory(index, 'ctaLink', `/products?category=${selectedCat.categoryName.toLowerCase()}`);
                                                    if (!category.title || category.title === 'New\nCategory') {
                                                        updateCategory(index, 'title', selectedCat.categoryName.split(' ').join('\n'));
                                                    }
                                                    if (!category.image || category.image === '/placeholder.jpg') {
                                                        updateCategory(index, 'image', selectedCat.image || '/placeholder.jpg');
                                                    }
                                                }
                                            }}
                                        >
                                            {backendCategories.map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                                        <Input
                                            value={category.name}
                                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Title</Label>
                                        <Input
                                            value={category.title}
                                            onChange={(e) => updateCategory(index, 'title', e.target.value)}
                                            placeholder="Hover\nBoards"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                                        <Input
                                            value={category.description}
                                            onChange={(e) => updateCategory(index, 'description', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Image URL</Label>
                                        <Input
                                            value={category.image}
                                            onChange={(e) => updateCategory(index, 'image', e.target.value)}
                                            placeholder="/assets/products/..."
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Text</Label>
                                        <Input
                                            value={category.ctaText}
                                            onChange={(e) => updateCategory(index, 'ctaText', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA Link</Label>
                                        <Input
                                            value={category.ctaLink}
                                            onChange={(e) => updateCategory(index, 'ctaLink', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Background</Label>
                                        <Input
                                            value={category.bgColor}
                                            onChange={(e) => updateCategory(index, 'bgColor', e.target.value)}
                                            placeholder="primary/10"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Border (Hover)</Label>
                                        <Input
                                            value={category.borderColor}
                                            onChange={(e) => updateCategory(index, 'borderColor', e.target.value)}
                                            placeholder="primary/30"
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Testimonials Tab */}
                <TabsContent value="testimonials" className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Manage customer testimonials</p>
                        <Button onClick={addTestimonial} size="sm" className="gap-2 h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
                            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Add Testimonial
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testimonials.map((testimonial, index) => (
                            <Card key={testimonial.id} className="border-secondary/20 shadow-sm relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTestimonial(index)}
                                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm md:text-base font-bold uppercase tracking-tight">Testimonial {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Customer Name</Label>
                                        <Input
                                            value={testimonial.name}
                                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Customer Image URL</Label>
                                        <Input
                                            value={testimonial.image}
                                            onChange={(e) => updateTestimonial(index, 'image', e.target.value)}
                                            className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Rating (1-5)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={testimonial.rating}
                                                onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                                            <Input
                                                value={testimonial.date}
                                                onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
                                                placeholder="e.g. Monday, Jan 16, 2023"
                                                className="h-9 md:h-10 bg-secondary/5 border-secondary/20 text-xs md:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Testimonial Text</Label>
                                        <textarea
                                            className="w-full min-h-[100px] flex rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={testimonial.text}
                                            onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Special Offers Tab */}
                <TabsContent value="offers" className="space-y-4">
                    <Card className="border-secondary/20 shadow-sm">
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-tight">Special Offers Section</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Manage the rotating special offer banners</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Section Title</Label>
                                <Input
                                    value={homeData.specialOffers?.title || 'SPECIAL OFFERS'}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        specialOffers: { ...prev.specialOffers, title: e.target.value }
                                    }))}
                                    placeholder="SPECIAL OFFERS"
                                    className="h-10 md:h-12 bg-secondary/5 border-secondary/20 text-xs md:text-sm font-bold uppercase"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Offer Sets (3 Images per set)</Label>
                                    <Button onClick={() => {
                                        setHomeData(prev => ({
                                            ...prev,
                                            specialOffers: {
                                                ...prev.specialOffers,
                                                offerSets: [
                                                    ...(prev.specialOffers?.offerSets || []),
                                                    { id: Date.now(), images: ['', '', ''] }
                                                ]
                                            }
                                        }));
                                    }} size="sm" className="gap-2 h-8 md:h-9 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
                                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        Add Set
                                    </Button>
                                </div>

                                {(homeData.specialOffers?.offerSets || []).map((set, setIndex) => (
                                    <Card key={set.id} className="border-secondary/20 bg-secondary/5 shadow-sm">
                                        <CardHeader className="py-3 px-4">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-tight">Set {setIndex + 1}</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setHomeData(prev => ({
                                                            ...prev,
                                                            specialOffers: {
                                                                ...prev.specialOffers,
                                                                offerSets: prev.specialOffers.offerSets.filter((_, i) => i !== setIndex)
                                                            }
                                                        }));
                                                    }}
                                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-7 w-7 p-0"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 grid gap-4 grid-cols-1 md:grid-cols-3">
                                            {set.images.map((img, imgIndex) => (
                                                <div key={imgIndex} className="space-y-2">
                                                    <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                        {imgIndex === 0 ? 'Left Image' : imgIndex === 1 ? 'Center Image (Main)' : 'Right Image'}
                                                    </Label>
                                                    <div className="relative group">
                                                        <div className="h-20 md:h-24 w-full bg-white rounded-xl overflow-hidden border border-secondary/20 mb-2 flex items-center justify-center p-2">
                                                            {img ? (
                                                                <img src={img} alt="Preview" className="h-full w-full object-contain" />
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground font-medium">No Image</span>
                                                            )}
                                                        </div>
                                                        <Input
                                                            value={img}
                                                            onChange={(e) => {
                                                                const newImages = [...set.images];
                                                                newImages[imgIndex] = e.target.value;
                                                                setHomeData(prev => ({
                                                                    ...prev,
                                                                    specialOffers: {
                                                                        ...prev.specialOffers,
                                                                        offerSets: prev.specialOffers.offerSets.map((s, i) =>
                                                                            i === setIndex ? { ...s, images: newImages } : s
                                                                        )
                                                                    }
                                                                }));
                                                            }}
                                                            placeholder="/assets/..."
                                                            className="h-8 md:h-9 text-[10px] md:text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
