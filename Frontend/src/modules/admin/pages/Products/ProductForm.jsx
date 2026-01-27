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
import { ArrowLeft, Save, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../../user/components/Toast';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getProductById, addProduct, updateProduct, categories, fetchCategories } = useAdminProductStore();
    const isEdit = !!id;

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

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
                        // Backend (getAllProducts/getProductById) is now returning parsed array in 'specifications'
                        // But let's be safe.
                        if (Array.isArray(product.specifications)) {
                            // If it's an array of objects directly
                            if (typeof product.specifications[0] === 'object') return product.specifications;
                            // If it's an array of strings (stringified JSON inside array)
                            if (typeof product.specifications[0] === 'string') {
                                try { return JSON.parse(product.specifications[0]); } catch (e) { return []; }
                            }
                        }
                        return [{ key: '', value: '' }];
                    })()
                });

                // Set preview if image exists
                if (product.image) setPreviewUrl(product.image);
                else if (product.images && product.images.length > 0) setPreviewUrl(product.images[0]);

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
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        if (selectedFile) {
            data.append('images', selectedFile);
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
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => navigate('/admin/products')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                        {isEdit ? 'Edit Toy' : 'Add New Toy'}
                    </h1>
                    <p className="text-muted-foreground font-medium italic">
                        {isEdit ? `Refining ${formData.name}` : 'A new addition to the toy kingdom'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Toy Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="E.G. TURBO THRILL HOVERBOARD"
                                className="h-14 rounded-2xl border-secondary/20 bg-background font-bold tracking-tight px-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Description</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                placeholder="Tell us why this toy is awesome..."
                                className="w-full bg-background border border-secondary/20 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium italic text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                >
                                    <SelectTrigger className="w-full h-14 bg-background border border-secondary/20 rounded-2xl px-6 font-bold uppercase tracking-widest text-xs ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem
                                                key={cat._id || cat}
                                                value={cat._id || cat} // Prefer ID
                                            >
                                                {(cat.categoryName || cat).toUpperCase()}
                                            </SelectItem>
                                        ))}
                                        {!categories.length && <SelectItem value="Other">OTHER</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                                >
                                    <SelectTrigger className="w-full h-14 bg-background border border-secondary/20 rounded-2xl px-6 font-bold uppercase tracking-widest text-xs ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all">
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
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <div className="flex justify-between items-center ml-2">
                            <Label className="text-xs font-black uppercase tracking-[0.2em]">Toy Specifications</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-primary font-bold uppercase tracking-widest text-[10px]"
                                onClick={addSpec}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Spec
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.specs.map((spec, index) => (
                                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        placeholder="Key (e.g. Weight)"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                        className="rounded-xl h-12 bg-background/50 border-secondary/10"
                                    />
                                    <Input
                                        placeholder="Value (e.g. 5kg)"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        className="rounded-xl h-12 bg-background/50 border-secondary/10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 rounded-full"
                                        onClick={() => removeSpec(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Media */}
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Toy Visuals</Label>
                        <div className="aspect-square bg-background border-2 border-dashed border-secondary/30 rounded-3xl overflow-hidden relative group">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-white hover:text-red-500 font-bold uppercase tracking-widest text-[10px]"
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" /> Clear
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center gap-4 cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                                    <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-wider">Upload Image</p>
                                        <p className="text-[10px] text-muted-foreground italic">Click to browse files</p>
                                    </div>
                                </div>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Inventory & Pricing */}
                    <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20 space-y-6">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] ml-2">Pricing & Stock</Label>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Base Price (INR)</Label>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="2499"
                                    className="h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Original Price (INR)</Label>
                                <Input
                                    name="originalPrice"
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    placeholder="2999"
                                    className="h-12 rounded-xl border-secondary/20 bg-background/50 font-black italic tracking-tighter"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">Stock Quantity</Label>
                                <Input
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    placeholder="50"
                                    className="h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sticky bottom-8 z-20 flex gap-4">
                        <Button
                            type="submit"
                            className="flex-1 h-14 rounded-full font-black italic tracking-widest uppercase shadow-xl shadow-primary/20"
                        >
                            <Save className="mr-2 h-5 w-5" />
                            {isEdit ? 'Update Toy' : 'Save Toy'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-14 rounded-full font-black italic tracking-widest uppercase px-8 border-secondary/20"
                            onClick={() => navigate('/admin/products')}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
