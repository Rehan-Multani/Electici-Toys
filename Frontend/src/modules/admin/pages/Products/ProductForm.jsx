import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminProductStore } from '../../store/adminProductStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { Label } from '../../../user/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../../user/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../user/components/ui/dropdown-menu';
import { ArrowLeft, Save, X, Image as ImageIcon, Plus, Trash2, Check, ChevronDown, Search } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getProductById, addProduct, updateProduct, categories, fetchCategories } = useAdminProductStore();
    const isEdit = !!id;

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [variants, setVariants] = useState([]); // [{ color: '', file: null, previewUrl: '', existingImage: '' }]

    // Searchable Category State
    const [categorySearch, setCategorySearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        status: 'Active',
        sku: '',
        specs: [{ key: '', value: '' }]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredCategories = categories.filter(c =>
        (c.categoryName || c).toLowerCase().includes(categorySearch.toLowerCase())
    );

    // ... inside render ...


    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (isEdit) {
            const product = getProductById(id);
            if (product) {
                setFormData({
                    name: product.name || product.productName || '',
                    description: product.description || '',
                    category: (product.categoryId?._id || (typeof product.categoryId === 'string' ? product.categoryId : '')) || '',
                    price: product.price?.toString() || '',
                    originalPrice: product.actualPrice?.toString() || product.originalPrice?.toString() || '',
                    stock: product.stock?.toString() || product.stockQuantity?.toString() || product.quantity?.toString() || '',
                    status: product.isActive ? 'Active' : (product.status === 'Active' ? 'Active' : 'Draft'),
                    sku: product.sku || '',
                    specs: (() => {
                        if (!product.specifications || product.specifications.length === 0) return [{ key: '', value: '' }];
                        if (Array.isArray(product.specifications)) {
                            if (typeof product.specifications[0] === 'object') return product.specifications;
                            if (typeof product.specifications[0] === 'string') {
                                try { return JSON.parse(product.specifications[0]); } catch (e) { return []; }
                            }
                        }
                        return [{ key: '', value: '' }];
                    })()
                });

                // Load Variants
                if (product.variants && product.variants.length > 0) {
                    setVariants(product.variants.map(v => ({
                        color: v.color,
                        file: null,
                        previewUrl: '',
                        existingImage: (v.images && v.images.length > 0) ? v.images[0] : ''
                    })));
                }

                // Set preview if image exists
                if (product.images && product.images.length > 0) {
                    setPreviewUrls(product.images);
                } else if (product.image) {
                    setPreviewUrls([product.image]);
                }

            } else {
                toast({
                    title: "Product not found",
                    description: "Redirecting to list...",
                    variant: "destructive"
                });
                navigate('/admin/products');
            }
        }
    }, [id, isEdit, getProductById]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        // If we want to support removing existing images locally (visual only as backend doesn't support delete yet)
        // or removing newly added ones.
        // Complex logic: need to know if index corresponds to existing or new.
        // Simple approach: Allow clearing NEWLY added files only or all?
        // Let's implement clearing specific NEW files.
        // But previewUrls is mixed.
        // For now, let's just allow clearing ALL for simplicity or rewrite logic to track separatly.
        // Let's stick to the prompt: "add multiple images". 
        // We will just allow clearing specific items from the preview list?
        // If we remove from previewUrls, we should remove from selectedFiles IF it matches.
        // This is tricky without tracking indices.
        // Alternative: Just separate Existing vs New in UI?
        // Let's try to keep it simple: "Clear" clears everything new?
        // Or nicer: Each image has an X.

        // Let's assume user wants to remove a just-added file.
        // We need to sync selectedFiles and previewUrls.
        // Since we blindly concatenated, we can assume the last N are new.
        // But if we have existing images, 'previewUrls' has M existing + N new.
        // 'selectedFiles' has N new.

        // Let's re-render logic in UI.
        // New handler for clearing all new files:
    };

    const clearNewFiles = () => {
        setSelectedFiles([]);
        // Re-calculate previews based on original product only
        if (isEdit) {
            const product = getProductById(id);
            if (product && product.images) setPreviewUrls(product.images);
            else setPreviewUrls([]);
        } else {
            setPreviewUrls([]);
        }
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...formData.specs];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    const addSpec = () => {
        setFormData(prev => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }));
    };

    const removeSpec = (index) => {
        setFormData(prev => ({ ...prev, specs: formData.specs.filter((_, i) => i !== index) }));
    };

    // Variant Helpers
    const addVariant = () => {
        setVariants([...variants, { color: '', file: null, previewUrl: '', existingImage: '' }]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantColorChange = (index, val) => {
        const newV = [...variants];
        newV[index].color = val;
        setVariants(newV);
    };

    const handleVariantFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newV = [...variants];
            newV[index].file = file;
            newV[index].previewUrl = URL.createObjectURL(file);
            // reset existing if new one added
            // newV[index].existingImage = ''; 
            setVariants(newV);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('productName', formData.name);
            data.append('description', formData.description);

            // Correct price and stock mapping for backend ProductModel
            const sellingPrice = parseFloat(formData.price) || 0;
            const actualPrice = parseFloat(formData.originalPrice) || sellingPrice;

            data.append('sellingPrice', sellingPrice);
            data.append('actualPrice', actualPrice);
            data.append('quantity', formData.stock);

            // SKU handling: generate for new products, keep for existing if needed
            // Since the form doesn't have a SKU field, we generate one.
            const sku = isEdit ? (formData.sku || `TOY-${Date.now()}`) : `TOY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            data.append('sku', sku);

            if (formData.category) {
                data.append('categoryId', formData.category);
            } else {
                // If category is required by backend, this might still fail.
                // But we'll let the user see the toast error if it does.
            }

            data.append('isActive', formData.status === 'Active');



            // Specs: Backend expects 'specifications' as a JSON string or array
            // Based on ProductCtrl.js: createProduct takes ...req.body.
            // If we send specifications as a stringified array of objects, the backend might just save it as is.
            // However, ProductModel defines specifications as [], so we should send it so it can be parsed or stored.
            // Let's send it as a JSON string to be safe, as FormData converts everything to string anyway.
            const validSpecs = formData.specs.filter(s => s.key && s.value);
            if (validSpecs.length > 0) {
                // Send as stringified JSON array
                data.append('specifications', JSON.stringify(validSpecs));
            } else {
                data.append('specifications', JSON.stringify([]));
            }

            // Variants Handling
            // We enforce 1 image per variant in this simplified form.

            const textVariants = variants.map(v => ({
                color: v.color,
                images: v.existingImage ? [v.existingImage] : [],
                imageCount: v.file ? 1 : 0
            }));

            data.append('variants', JSON.stringify(textVariants));

            // Append variant files
            variants.forEach(v => {
                if (v.file) data.append('images', v.file);
            });

            // Append General files (if any)
            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            let result;
            if (isEdit) {
                result = await updateProduct(id, data);
                if (result.success) {
                    toast({ title: "Toy Updated!", description: `${formData.name} has been refreshed.` });
                } else {
                    toast({ title: "Update Failed", description: result.error, variant: "destructive" });
                }
            } else {
                result = await addProduct(data);
                if (result.success) {
                    toast({ title: "New Toy Added!", description: `${formData.name} is now available.` });
                } else {
                    toast({ title: "Add Failed", description: result.error, variant: "destructive" });
                }
            }

            if (result.success) {
                navigate('/admin/products');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 md:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 md:h-10 md:w-10"
                    onClick={() => navigate('/admin/products')}
                >
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">
                        {isEdit ? 'Edit Toy' : 'Add New Toy'}
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium italic">
                        {isEdit ? `Refining ${formData.name}` : 'A new addition to the toy kingdom'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">Toy Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="E.G. TURBO THRILL HOVERBOARD"
                                className="h-10 md:h-14 rounded-xl md:rounded-2xl border-secondary/20 bg-background font-bold tracking-tight px-4 md:px-6 text-xs md:text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">Description</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                placeholder="Tell us why this toy is awesome..."
                                className="w-full bg-background border border-secondary/20 rounded-xl md:rounded-2xl p-4 md:p-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium italic text-xs md:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">Category</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full h-10 md:h-14 bg-background border border-secondary/20 rounded-xl md:rounded-2xl px-4 md:px-6 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-between outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <span className={!formData.category ? "text-muted-foreground" : ""}>
                                                {formData.category
                                                    ? (categories.find(c => (c._id || c) === formData.category)?.categoryName || formData.category).toUpperCase()
                                                    : "SELECT CATEGORY"
                                                }
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-0 bg-popover z-50" align="start">
                                        <div className="flex items-center border-b px-3">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <input
                                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Search category..."
                                                value={categorySearch}
                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-[300px] overflow-auto p-1">
                                            {filteredCategories.map((cat) => (
                                                <DropdownMenuItem
                                                    key={cat._id || cat}
                                                    onSelect={() => {
                                                        setFormData(prev => ({ ...prev, category: cat._id || cat }));
                                                        setCategorySearch('');
                                                    }}
                                                    className="flex items-center justify-between cursor-pointer"
                                                >
                                                    {(cat.categoryName || cat).toUpperCase()}
                                                    {formData.category === (cat._id || cat) && <Check className="h-4 w-4 opacity-50" />}
                                                </DropdownMenuItem>
                                            ))}
                                            {filteredCategories.length === 0 && (
                                                <div className="py-6 text-center text-sm text-muted-foreground">No category found.</div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                                >
                                    <SelectTrigger className="w-full h-10 md:h-14 bg-background border border-secondary/20 rounded-xl md:rounded-2xl px-4 md:px-6 font-bold uppercase tracking-widest text-[10px] md:text-xs ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">ACTIVE</SelectItem>
                                        <SelectItem value="Draft">DRAFT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
                        <div className="flex justify-between items-center ml-2">
                            <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Toy Specifications</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px]"
                                onClick={addSpec}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Spec
                            </Button>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {formData.specs.map((spec, index) => (
                                <div key={index} className="flex gap-2 md:gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        placeholder="Key (e.g. Weight)"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                        className="rounded-lg md:rounded-xl h-10 md:h-12 bg-background/50 border-secondary/10 text-xs md:text-sm"
                                    />
                                    <Input
                                        placeholder="Value (e.g. 5kg)"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        className="rounded-lg md:rounded-xl h-10 md:h-12 bg-background/50 border-secondary/10 text-xs md:text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
                                        onClick={() => removeSpec(index)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 md:space-y-8">
                    {/* Color Variants: Simplified One-Color-One-Image */}
                    <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
                        <div className="flex justify-between items-center ml-2">
                            <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Color Variants</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px]"
                                onClick={addVariant}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Color
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {variants.map((v, index) => (
                                <div key={index} className="bg-background/40 p-3 md:p-4 rounded-xl border border-secondary/20 flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-2">
                                    <input
                                        type="text"
                                        placeholder="Color Name (e.g. Red)"
                                        value={v.color}
                                        onChange={(e) => handleVariantColorChange(index, e.target.value)}
                                        className="flex-1 min-w-[150px] md:min-w-[200px] h-10 rounded-xl border border-input bg-white text-black px-4 py-2 text-sm font-bold shadow-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />

                                    {/* Image Upload/Preview */}
                                    <div className="flex-shrink-0 relative group h-12 w-12 md:h-14 md:w-14">
                                        {v.previewUrl || v.existingImage ? (
                                            <div
                                                className="w-full h-full rounded-lg overflow-hidden border border-secondary/20 cursor-pointer relative"
                                                onClick={() => document.getElementById(`variant-file-${index}`).click()}
                                            >
                                                <img
                                                    src={v.previewUrl || v.existingImage}
                                                    className="w-full h-full object-cover"
                                                    alt="Variant"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="w-full h-full rounded-lg border border-dashed border-secondary/40 flex items-center justify-center cursor-pointer hover:border-primary/50 bg-background/50 transition-colors"
                                                onClick={() => document.getElementById(`variant-file-${index}`).click()}
                                            >
                                                <Plus className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <input
                                            id={`variant-file-${index}`}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleVariantFileChange(index, e)}
                                            className="hidden"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 rounded-full h-8 w-8 hover:bg-red-50"
                                        onClick={() => removeVariant(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {variants.length === 0 && (
                                <div className="text-center p-4 text-[10px] text-muted-foreground italic border border-dashed border-secondary/20 rounded-xl">
                                    No variants added. Click "Add Color" to define specific colors.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inventory & Pricing */}
                    <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
                        <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">Pricing & Stock</Label>

                        <div className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Base Price (INR)</Label>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="2499"
                                    className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter text-xs md:text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Original Price (INR)</Label>
                                <Input
                                    name="originalPrice"
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    placeholder="2999"
                                    className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background/50 font-black italic tracking-tighter text-xs md:text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Stock Quantity</Label>
                                <Input
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    placeholder="50"
                                    className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter text-xs md:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sticky bottom-8 z-20 flex gap-3 md:gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-12 md:h-14 rounded-full font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 text-xs md:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    {isEdit ? 'Update Toy' : 'Save Toy'}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 md:h-14 rounded-full font-black italic tracking-widest uppercase px-6 md:px-8 border-secondary/20 text-xs md:text-sm"
                            onClick={() => navigate('/admin/products')}
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
