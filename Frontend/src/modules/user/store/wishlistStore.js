import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],
            loading: false,
            error: null,

            fetchWishlist: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/wishlist');
                    if (response.data.success) {
                        const mappedItems = response.data.wishlist.map(item => {
                            const p = item.productId;
                            if (!p) return null; // Handle deleted products

                            let image = p.images && p.images.length > 0 ? p.images[0] : null;
                            if (image && image.endsWith(':1')) image = image.replace(/:\d+$/, '');

                            return {
                                id: p._id,
                                name: p.productName,
                                price: p.sellingPrice || p.actualPrice,
                                originalPrice: p.actualPrice,
                                image: image,
                                category: p.categoryId?.categoryName || 'General',
                                rating: p.rating || 0,
                                numReviews: p.numReviews || 0,
                                description: p.description
                            };
                        }).filter(Boolean);

                        set({ items: mappedItems });
                    }
                } catch (error) {
                    // Only set error if not 401 (unauthorized) as guest user might view empty wishlist
                    if (error.response?.status !== 401) {
                        set({ error: error.message });
                    } else {
                        // If 401, keep local items or empty? Let's keep empty for sync
                        set({ items: [] });
                    }
                } finally {
                    set({ loading: false });
                }
            },

            toggleWishlist: async (product) => {
                const { items } = get();
                // Ensure we use the correct ID field -> product.id should match what we store (usually _id from backend)
                const isExist = items.find((item) => item.id === product.id);

                // Optimistic Update
                if (isExist) {
                    set({
                        items: items.filter((item) => item.id !== product.id),
                    });

                    try {
                        // Backend expects { productId: _id } body for DELETE? 
                        // Router says: router.delete("/", ...removeFromWishlist) which reads req.body.productId
                        // Ideally DELETE should use params /:id, but controller uses body.
                        // Axios delete with body requires `data` property.
                        await api.delete('/wishlist', { data: { productId: product.id } });
                    } catch (error) {
                        // Revert if failed
                        set({ items: [...items] });
                        console.error("Failed to remove from wishlist", error);
                    }

                } else {
                    set({ items: [...items, product] });
                    try {
                        await api.post('/wishlist', { productId: product.id });
                    } catch (error) {
                        // Revert
                        set({ items });
                        console.error("Failed to add to wishlist", error);
                    }
                }
            },

            isInWishlist: (productId) => {
                // Determine if productId is string or number to match robustly
                return !!get().items.find((item) => String(item.id) === String(productId));
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
