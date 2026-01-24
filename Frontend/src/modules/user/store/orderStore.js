import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useOrderStore = create(
    persist(
        (set, get) => ({
            orders: [],
            loading: false,
            error: null,

            fetchOrders: async () => {
                set({ loading: true, error: null });
                try {
                    // Note: We need api import here, but it's a store file.
                    // It is better to import api at top level.
                    // Assuming 'api' is passed or imported. We will modify imports below.
                    const response = await api.get('/order/user'); // Assuming endpoint exists

                    if (response.data.success) {
                        const mappedOrders = response.data.orders.map(order => ({
                            id: order._id, // Use DB _id for operations
                            orderId: order.orderId, // Display ID
                            date: order.createdAt,
                            items: order.products.map(p => ({
                                id: p.productId?._id,
                                name: p.productId?.productName || "Unknown Product",
                                image: p.productId?.images?.[0] ?
                                    (p.productId.images[0].endsWith(':1') ? p.productId.images[0].slice(0, -2) : p.productId.images[0])
                                    : '',
                                price: p.price,
                                quantity: p.quantity
                            })),
                            subtotal: order.totalAmount,
                            total: order.grandTotal || order.totalAmount,
                            shippingAmount: order.shippingAmount || 0,
                            codCharge: order.codCharge || 0,
                            grandTotal: order.grandTotal || order.totalAmount,
                            status: order.orderStatus,
                            shippingAddress: order.shippingAddress ?
                                `${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`
                                : (order.shippingAddressId ?
                                    `${order.shippingAddressId.addressLine1}, ${order.shippingAddressId.city}` : "Address not available"),
                            customerPhone: order.shippingAddress?.phone || "N/A",
                            paymentMethod: order.paymentMethod
                        }));
                        set({ orders: mappedOrders });
                    }
                } catch (error) {
                    set({ error: error.message });
                    console.error("Failed to fetch orders", error);
                } finally {
                    set({ loading: false });
                }
            },

            addOrder: (orderData, cartItems, total) => {
                // Local optimistic update or just trigger refetch?
                // Ideally backend handles creation. We might just re-fetch.
                // Keeping basic impl or removing if not used directly anymore by frontend logic (since checkout handles API calls)
            },

            getOrder: (id) => {
                return get().orders.find(o => o.id === id);
            }
        }),
        {
            name: 'order-storage',
        }
    )
);
