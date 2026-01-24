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
        <div className="p-6 max-w-7xl mx-auto relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Home Page Content</h1>
                    <p className="text-muted-foreground mt-2">Manage hero section, trust markers, categories, and testimonials</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} className="gap-2" disabled={loading}>
                        <RotateCcw className="h-4 w-4" />
                        Discard Changes
                    </Button>
                    <Button onClick={handleSave} className="gap-2" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="hero" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="hero">Hero Section</TabsTrigger>
                    <TabsTrigger value="trust">Trust Markers</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                    <TabsTrigger value="offers">Special Offers</TabsTrigger>
                </TabsList>

                {/* Hero Section Tab */}
                <TabsContent value="hero" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Section</CardTitle>
                            <CardDescription>Main banner content and call-to-action</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Background Image URL</Label>
                                <Input
                                    value={homeData.hero.image || (homeData.hero.images && homeData.hero.images[0]) || ''}
                                    onChange={(e) => updateHero('image', e.target.value)}
                                    placeholder="/hero.png"
                                />
                                <p className="text-xs text-muted-foreground">Recommended size: 1920x1080px</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Main Heading</Label>
                                <Input
                                    value={homeData.hero.heading}
                                    onChange={(e) => updateHero('heading', e.target.value)}
                                    placeholder="UNLEASH THE POWER OF PLAY"
                                    className="text-lg font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CTA Button Text</Label>
                                    <Input
                                        value={homeData.hero.ctaText}
                                        onChange={(e) => updateHero('ctaText', e.target.value)}
                                        placeholder="SHOP COLLECTION"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA Link</Label>
                                    <Input
                                        value="/products"
                                        disabled
                                        className="bg-secondary/50 font-medium"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Fixed to product collection page.</p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-6 bg-secondary/20 rounded-lg border-2 border-dashed">
                                <p className="text-xs text-muted-foreground mb-4 uppercase font-bold">Preview</p>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{homeData.hero.heading}</h2>
                                    <Button className="rounded-full font-black italic">{homeData.hero.ctaText}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Featured Section</CardTitle>
                                    <CardDescription>Title and subtitle for products showcase</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={homeData.featuredSection.title}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        featuredSection: { ...prev.featuredSection, title: e.target.value }
                                    }))}
                                    placeholder="THE HIT LIST"
                                    className="font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Section Subtitle</Label>
                                <Input
                                    value={homeData.featuredSection.subtitle}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        featuredSection: { ...prev.featuredSection, subtitle: e.target.value }
                                    }))}
                                    placeholder="Our most-wanted electric wonders."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CTA Text</Label>
                                    <Input
                                        value={homeData.featuredSection.ctaText}
                                        onChange={(e) => setHomeData(prev => ({
                                            ...prev,
                                            featuredSection: { ...prev.featuredSection, ctaText: e.target.value }
                                        }))}
                                        placeholder="All Products"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA Link</Label>
                                    <Input
                                        value="/products"
                                        disabled
                                        className="bg-secondary/50 font-medium"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Fixed to product collection page.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trust Markers Tab */}
                <TabsContent value="trust" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Manage trust markers (warranty, shipping, etc.)</p>
                        <Button onClick={addTrustMarker} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Marker
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {homeData.trustMarkers.map((marker, index) => (
                            <Card key={marker.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Marker {index + 1}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTrustMarker(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Icon Name (Lucide)</Label>
                                        <Input
                                            value={marker.icon}
                                            onChange={(e) => updateTrustMarker(index, 'icon', e.target.value)}
                                            placeholder="Shield"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use: Shield, Truck, CreditCard, RotateCcw, etc.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={marker.title}
                                            onChange={(e) => updateTrustMarker(index, 'title', e.target.value)}
                                            placeholder="1-YEAR WARRANTY"
                                            className="font-bold uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={marker.description}
                                            onChange={(e) => updateTrustMarker(index, 'description', e.target.value)}
                                            placeholder="Full peace of mind"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Manage featured category cards</p>
                        <Button onClick={addCategory} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Category
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {homeData.categories.map((category, index) => (
                            <Card key={category.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{category.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCategory(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label>Link to Backend Category</Label>
                                        <select
                                            className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={category.backendId}
                                            onChange={(e) => {
                                                const selectedCat = backendCategories.find(c => c._id === e.target.value);
                                                if (selectedCat) {
                                                    updateCategory(index, 'backendId', selectedCat._id);
                                                    updateCategory(index, 'name', selectedCat.categoryName);
                                                    updateCategory(index, 'ctaLink', `/products?category=${selectedCat.categoryName.toLowerCase()}`);
                                                    // Only update these if they are still defaults or empty
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
                                    <div className="space-y-2">
                                        <Label>Display Name</Label>
                                        <Input
                                            value={category.name}
                                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Display Title</Label>
                                        <Input
                                            value={category.title}
                                            onChange={(e) => updateCategory(index, 'title', e.target.value)}
                                            placeholder="Hover\nBoards"
                                        />
                                        <p className="text-xs text-muted-foreground">Use \n for line breaks</p>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={category.description}
                                            onChange={(e) => updateCategory(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Image URL</Label>
                                        <Input
                                            value={category.image}
                                            onChange={(e) => updateCategory(index, 'image', e.target.value)}
                                            placeholder="/assets/products/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CTA Text</Label>
                                        <Input
                                            value={category.ctaText}
                                            onChange={(e) => updateCategory(index, 'ctaText', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CTA Link</Label>
                                        <Input
                                            value={category.ctaLink}
                                            onChange={(e) => updateCategory(index, 'ctaLink', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Background Color</Label>
                                        <Input
                                            value={category.bgColor}
                                            onChange={(e) => updateCategory(index, 'bgColor', e.target.value)}
                                            placeholder="primary/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Border Color (Hover)</Label>
                                        <Input
                                            value={category.borderColor}
                                            onChange={(e) => updateCategory(index, 'borderColor', e.target.value)}
                                            placeholder="primary/30"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Testimonials Tab */}
                {/* Testimonials Tab */}
                <TabsContent value="testimonials" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Manage customer testimonials</p>
                        <Button onClick={addTestimonial} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Testimonial
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testimonials.map((testimonial, index) => (
                            <Card key={testimonial.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Testimonial {index + 1}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTestimonial(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Customer Name</Label>
                                        <Input
                                            value={testimonial.name}
                                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Customer Image URL</Label>
                                        <Input
                                            value={testimonial.image}
                                            onChange={(e) => updateTestimonial(index, 'image', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Rating (1-5)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={testimonial.rating}
                                                onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                value={testimonial.date}
                                                onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
                                                placeholder="e.g. Monday, Jan 16, 2023"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Testimonial Text</Label>
                                        <textarea
                                            className="w-full min-h-[100px] flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Special Offers Section</CardTitle>
                            <CardDescription>Manage the rotating special offer banners</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={homeData.specialOffers?.title || 'SPECIAL OFFERS'}
                                    onChange={(e) => setHomeData(prev => ({
                                        ...prev,
                                        specialOffers: { ...prev.specialOffers, title: e.target.value }
                                    }))}
                                    placeholder="SPECIAL OFFERS"
                                    className="font-bold uppercase"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Offer Sets (3 Images per set)</Label>
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
                                    }} size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Set
                                    </Button>
                                </div>

                                {(homeData.specialOffers?.offerSets || []).map((set, setIndex) => (
                                    <Card key={set.id} className="border-secondary/20">
                                        <CardHeader className="py-4">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base">Set {setIndex + 1}</CardTitle>
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
                                                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 md:grid-cols-3">
                                            {set.images.map((img, imgIndex) => (
                                                <div key={imgIndex} className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">
                                                        {imgIndex === 0 ? 'Left Image' : imgIndex === 1 ? 'Center Image (Main)' : 'Right Image'}
                                                    </Label>
                                                    <div className="relative group">
                                                        <div className="h-24 w-full bg-secondary/10 rounded-lg overflow-hidden border border-secondary/20 mb-2 flex items-center justify-center">
                                                            {img ? (
                                                                <img src={img} alt="Preview" className="h-full w-full object-contain" />
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">No Image</span>
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
                                                            className="text-xs"
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
