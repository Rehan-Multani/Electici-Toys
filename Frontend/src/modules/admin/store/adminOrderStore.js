import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminOrderStore = create(
    persist(
        (set, get) => ({
            orders: [],
            loading: false,
            error: null,

            fetchOrders: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/order');
                    if (response.data.success) {
                        const mappedOrders = response.data.orders.map(order => {
                            // Map Address
                            let formattedAddress = 'N/A';
                            const addr = order.shippingAddress || order.shippingAddressId;
                            if (addr) {
                                formattedAddress = `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country || 'India'}`;
                            }

                            // Map Items
                            const items = order.products.map(p => {
                                let img = p.productId?.images?.[0] || null;
                                if (img && img.endsWith(':1')) img = img.replace(/:\d+$/, '');

                                return {
                                    id: p.productId?._id,
                                    name: p.productId?.productName || 'Unknown Product',
                                    quantity: p.quantity,
                                    price: p.price,
                                    image: img
                                };
                            });

                            // Map User
                            const customerName = order.shippingAddress?.name || order.userId?.fullName || order.userId?.name || 'Unknown User';
                            const customerEmail = order.shippingAddress?.email || order.userId?.email || 'N/A';
                            const customerPhone = order.shippingAddress?.phone || order.shippingAddressId?.phone || 'N/A';

                            return {
                                id: order._id, // Use _id for operations
                                displayId: order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'N/A'), // For visual
                                customer: customerName,
                                email: customerEmail,
                                phone: customerPhone,
                                date: order.createdAt,
                                totalAmount: order.totalAmount,
                                shippingAmount: order.shippingAmount || 0,
                                codCharge: order.codCharge || 0,
                                grandTotal: order.grandTotal || order.totalAmount,
                                total: order.grandTotal || order.totalAmount, // For backward compatibility
                                status: order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending', // Capitalize
                                items: items,
                                address: formattedAddress,
                                paymentMethod: order.paymentMethod,
                                shippingAddress: order.shippingAddress || order.shippingAddressId,
                                // Keep original object just in case
                                ...order
                            };
                        });

                        set({ orders: mappedOrders });
                    }
                } catch (error) {
                    set({ error: error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            updateOrderStatus: async (id, status) => {
                set({ loading: true, error: null });
                try {
                    // Backend expects { orderId: _id, newStatus: string }
                    // My backend fix changed findOne({orderId}) to findById(orderId), so passing _id is correct.
                    const response = await api.put('/order/update-status', {
                        orderId: id,
                        newStatus: status.toLowerCase()
                    });

                    if (response.data.success) {
                        // Optimistic update or refetch
                        // Let's refetch to be safe, or update local
                        set({
                            orders: get().orders.map(o =>
                                o.id === id ? { ...o, status: status } : o // Update status field
                            )
                        });
                        // await get().fetchOrders(); // Un-comment if full sync needed
                    } else {
                        set({ error: response.data.message });
                    }
                } catch (error) {
                    set({ error: error.response?.data?.message || error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            getOrderById: (id) => {
                return get().orders.find(o => o.id === id);
            },

            getStats: () => {
                const orders = get().orders;
                return {
                    totalRevenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0),
                    pendingOrders: orders.filter(o => o.status === 'Pending').length,
                    shippedOrders: orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length,
                    averageOrder: orders.length > 0 ? orders.reduce((acc, curr) => acc + (curr.total || 0), 0) / orders.length : 0
                };
            }
        }),
        {
            name: 'admin-order-storage',
            // storage: createJSONStorage(() => sessionStorage), // Optional: change storage type
        }
    )
);
