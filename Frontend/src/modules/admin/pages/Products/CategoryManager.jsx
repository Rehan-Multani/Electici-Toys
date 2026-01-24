import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminProductStore } from '../../store/adminProductStore';
import { Button } from '../../../user/components/ui/button';
import { Plus, Trash2, Tag, Image as ImageIcon, X } from 'lucide-react';
import { Badge } from '../../../user/components/ui/badge';

export default function CategoryManager() {
    const { categories, addCategory, deleteCategory, fetchCategories } = useAdminProductStore();
    const [newCategory, setNewCategory] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            const formData = new FormData();
            formData.append('categoryName', newCategory.trim());
            formData.append('description', 'Added via Admin Panel');
            if (image) {
                formData.append('image', image);
            }
            await addCategory(formData);
            setNewCategory('');
            setImage(null);
            setImagePreview(null);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Categories</h1>
                    <p className="text-muted-foreground font-medium italic">Manage product categories ({categories.length} total)</p>
                </div>
            </div>

            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">New Category Name</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="E.g. Electric Skateboards"
                                    className="w-full bg-secondary/5 border border-secondary/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-bold uppercase tracking-wider text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Category Image</label>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="category-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="category-image"
                                        className="flex items-center justify-center h-12 px-6 bg-secondary/5 border border-secondary/20 border-dashed rounded-2xl cursor-pointer hover:bg-secondary/10 transition-all gap-2"
                                    >
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            {image ? 'Change Image' : 'Upload Image'}
                                        </span>
                                    </label>
                                </div>

                                {imagePreview && (
                                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-secondary/20 shadow-sm">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImage(null); setImagePreview(null); }}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                )}
                                
                                <Button
                                    type="submit"
                                    disabled={!newCategory.trim()}
                                    className="ml-auto rounded-full font-black italic tracking-widest uppercase px-8 h-12 shadow-lg shadow-primary/20"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Category List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {categories.map((category) => (
                        <motion.div
                            key={category._id || category}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-5 rounded-3xl border border-secondary/20 flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-primary overflow-hidden">
                                    {category.image ? (
                                        <img src={category.image} alt={category.categoryName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase italic tracking-tight">{category.categoryName || category}</h3>
                                    <Badge variant="secondary" className="mt-1 text-[10px] tracking-widest bg-secondary/20">Active</Badge>
                                </div>
                            </div>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteCategory(category._id)}
                                className="h-10 w-10 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
