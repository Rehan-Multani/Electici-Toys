import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminProductStore = create(
    persist(
        (set, get) => ({
            products: [],
            categories: [],
            loading: false,
            error: null,
            total: 0,
            page: 1,

            // Clear products manually if needed
            clearProducts: () => set({ products: [] }),

            // Fetch categories from backend
            fetchCategories: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/category/all');
                    if (response.data.success) {
                        set({ categories: response.data.data });
                    }
                } catch (error) {
                    set({ error: error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            addCategory: async (formData) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.post('/category/create', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.data.success) {
                        // Refetch to ensure sync
                        await get().fetchCategories();
                    }
                } catch (error) {
                    set({ error: error.response?.data?.message || error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            deleteCategory: async (categoryId) => {
                set({ loading: true, error: null });
                try {
                    await api.delete(`/category/delete/${categoryId}`);
                    // Refetch
                    await get().fetchCategories();
                } catch (error) {
                    set({ error: error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            // ================= PRODUCT ACTIONS =================

            fetchProducts: async (page = 1, limit = 100) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get(`/product?page=${page}&limit=${limit}`);
                    if (response.data.success) {
                        // Map backend structure to frontend structure if needed
                        const mappedProducts = response.data.products.map(p => {
                            let image = p.images && p.images.length > 0 ? p.images[0] : null;
                            if (image && image.endsWith(':1')) image = image.replace(/:\d+$/, '');

                            return {
                                id: p._id,
                                name: p.productName,
                                category: p.categoryId?.categoryName || 'Unknown',
                                price: p.sellingPrice || p.actualPrice,
                                actualPrice: p.actualPrice,
                                sellingPrice: p.sellingPrice,
                                stock: p.quantity,
                                status: p.isActive ? 'Active' : 'Draft',
                                image: image,
                                ...p
                            };
                        });

                        set({
                            products: mappedProducts,
                            total: response.data.total,
                            page: response.data.page
                        });
                    }
                } catch (error) {
                    set({ error: error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            addProduct: async (productData) => {
                set({ loading: true, error: null });
                try {
                    // Note: Backend expects FormData for file uploads (images)
                    // If productData is not FormData, we might need to convert or expect FormData to be passed

                    // Assuming productData is passed as FormData from the component if it has files
                    // OR standard JSON if no files.

                    // Backend: /products (POST)
                    const headers = productData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
                    const response = await api.post('/product', productData, { headers });

                    if (response.data.success) {
                        await get().fetchProducts(); // Refresh list
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    const msg = error.response?.data?.message || 'Failed to add product';
                    set({ error: msg, loading: false });
                    return { success: false, error: msg };
                } finally {
                    set({ loading: false });
                }
            },

            updateProduct: async (id, updates) => {
                set({ loading: true, error: null });
                try {
                    // Backend: /products/:id (PUT)
                    const headers = updates instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
                    const response = await api.put(`/product/${id}`, updates, { headers });

                    if (response.data.success) {
                        await get().fetchProducts();
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    const msg = error.response?.data?.message || 'Failed to update product';
                    set({ error: msg, loading: false });
                    return { success: false, error: msg };
                } finally {
                    set({ loading: false });
                }
            },

            deleteProduct: async (id) => {
                set({ loading: true, error: null });
                try {
                    // Backend: /products/:id (DELETE)
                    const response = await api.delete(`/product/${id}`);
                    if (response.data.success) {
                        set({
                            products: get().products.filter((p) => p.id !== id),
                        });
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    set({ error: error.message, loading: false });
                    return { success: false, error: error.message };
                } finally {
                    set({ loading: false });
                }
            },

            getProductById: (id) => {
                return get().products.find((p) => String(p.id) === String(id));
            },

            toggleStatus: async (id) => {
                // Since this might require a backend call, we should implement a dedicated endpoint
                // or just update using updateProduct.
                // Assuming updateProduct handles Partial updates:
                const product = get().products.find(p => p.id === id);
                if (!product) return;

                const newStatus = product.status === 'Active' ? false : true;
                // Backend uses isActive boolean
                // We'll call updateProduct with { isActive: newStatus }
                // But updateProduct expects FormData or JSON. 

                // Let's optimize optimistic update for better UX
                set({
                    products: get().products.map((p) =>
                        p.id === id
                            ? { ...p, status: newStatus ? 'Active' : 'Draft', isActive: newStatus }
                            : p
                    ),
                });

                try {
                    await api.put(`/product/${id}`, { isActive: newStatus });
                } catch (error) {
                    // Revert on fail
                    set({
                        products: get().products.map((p) =>
                            p.id === id
                                ? { ...p, status: !newStatus ? 'Active' : 'Draft', isActive: !newStatus }
                                : p
                        ),
                    });
                    // console.error("Toggle failed", error);
                }
            }
        }),
        {
            name: 'admin-product-storage',
            version: 1,
            // Clean up old mock data format if migrating
            migrate: (persistedState, version) => {
                if (version === 0 || !version) {
                    return { ...persistedState, products: [], categories: [] };
                }
                return persistedState;
            },
        }
    )
);
