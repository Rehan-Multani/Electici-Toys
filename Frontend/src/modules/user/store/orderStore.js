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
                    const response = await api.get('/order/user');

                    if (response.data.success) {
                        const mappedOrders = response.data.orders.map(order => ({
                            id: order._id,
                            orderId: order.orderId,
                            date: order.createdAt,
                            items: order.products.map(p => ({
                                id: p.productId?._id,
                                name: p.productId?.productName || "Unknown Product",
                                image: p.image || (p.productId?.images?.[0] ?
                                    (p.productId.images[0].endsWith(':1') ? p.productId.images[0].slice(0, -2) : p.productId.images[0])
                                    : ''),
                                price: p.price,
                                color: p.color,
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
                            paymentMethod: order.paymentMethod,
                            paymentStatus: order.paymentStatus,
                            // Cancel/Return fields
                            cancelReason: order.cancelReason,
                            cancelRequestedAt: order.cancelRequestedAt,
                            cancelApprovedByAdmin: order.cancelApprovedByAdmin,
                            cancelAdminResponse: order.cancelAdminResponse,
                            returnReason: order.returnReason,
                            returnRequestedAt: order.returnRequestedAt,
                            returnApprovedByAdmin: order.returnApprovedByAdmin,
                            returnAdminResponse: order.returnAdminResponse,
                            refundStatus: order.refundStatus,
                            refundAmount: order.refundAmount,
                            deliveredAt: order.statusTimestamps?.delivered
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

            requestCancel: async (orderId, cancelReason, refundDetails = null) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.put('/order/request-cancel', {
                        orderId,
                        cancelReason,
                        refundDetails
                    });
                    if (response.data.success) {
                        await get().fetchOrders();
                        return { success: true, message: response.data.message };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    const message = error.response?.data?.message || error.message;
                    set({ error: message });
                    return { success: false, message };
                } finally {
                    set({ loading: false });
                }
            },

            requestReturn: async (orderId, returnReason, refundDetails = null) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.put('/order/request-return', {
                        orderId,
                        returnReason,
                        refundDetails
                    });
                    if (response.data.success) {
                        await get().fetchOrders();
                        return { success: true, message: response.data.message };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    const message = error.response?.data?.message || error.message;
                    set({ error: message });
                    return { success: false, message };
                } finally {
                    set({ loading: false });
                }
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

