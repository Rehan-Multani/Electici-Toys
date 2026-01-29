import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminOrderStore = create(
    persist(
        (set, get) => ({
            orders: [],
            loading: false,
            error: null,
            dashboardStats: null,

            fetchOrders: async (filter = null) => {
                set({ loading: true, error: null });
                try {
                    const url = filter ? `/order/filtered?filter=${filter}` : '/order';
                    const response = await api.get(url);
                    if (response.data.success) {
                        const mappedOrders = response.data.orders.map(order => {
                            let formattedAddress = 'N/A';
                            const addr = order.shippingAddress || order.shippingAddressId;
                            if (addr) {
                                formattedAddress = `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country || 'India'}`;
                            }

                            const items = order.products.map(p => {
                                let img = p.image || p.productId?.images?.[0] || null;
                                if (img && img.endsWith(':1')) img = img.replace(/:\d+$/, '');
                                return {
                                    id: p.productId?._id,
                                    name: p.productId?.productName || 'Unknown Product',
                                    quantity: p.quantity,
                                    price: p.price,
                                    color: p.color,
                                    image: img
                                };
                            });

                            const customerName = order.shippingAddress?.name || order.userId?.fullName || order.userId?.name || 'Unknown User';
                            const customerEmail = order.shippingAddress?.email || order.userId?.email || 'N/A';
                            const customerPhone = order.shippingAddress?.phone || order.shippingAddressId?.phone || 'N/A';

                            return {
                                id: order._id,
                                displayId: order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'N/A'),
                                customer: customerName,
                                email: customerEmail,
                                phone: customerPhone,
                                date: order.createdAt,
                                totalAmount: order.totalAmount,
                                shippingAmount: order.shippingAmount || 0,
                                codCharge: order.codCharge || 0,
                                grandTotal: order.grandTotal || order.totalAmount,
                                total: order.grandTotal || order.totalAmount,
                                status: order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending',
                                items: items,
                                address: formattedAddress,
                                paymentMethod: order.paymentMethod,
                                paymentStatus: order.paymentStatus,
                                shippingAddress: order.shippingAddress || order.shippingAddressId,
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
                                refundDetails: order.refundDetails,
                                stockRestored: order.stockRestored,
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

            fetchDashboardStats: async () => {
                try {
                    const response = await api.get('/order/dashboard-stats');
                    if (response.data.success) {
                        set({ dashboardStats: response.data.stats });
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                }
            },

            updateOrderStatus: async (id, status) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.put('/order/update-status', {
                        orderId: id,
                        newStatus: status.toLowerCase()
                    });
                    if (response.data.success) {
                        set({
                            orders: get().orders.map(o =>
                                o.id === id ? { ...o, status: status } : o
                            )
                        });
                        return { success: true };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    set({ error: error.response?.data?.message || error.message, loading: false });
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            // Cancel/Return Admin Actions
            approveCancel: async (orderId) => {
                set({ loading: true });
                try {
                    const response = await api.put('/order/admin/approve-cancel', { orderId });
                    if (response.data.success) {
                        await get().fetchOrders();
                        await get().fetchDashboardStats();
                        return { success: true, message: "Cancel approved successfully" };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            rejectCancel: async (orderId, reason) => {
                set({ loading: true });
                try {
                    const response = await api.put('/order/admin/reject-cancel', { orderId, reason });
                    if (response.data.success) {
                        await get().fetchOrders();
                        return { success: true, message: "Cancel rejected" };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            approveReturn: async (orderId) => {
                set({ loading: true });
                try {
                    const response = await api.put('/order/admin/approve-return', { orderId });
                    if (response.data.success) {
                        await get().fetchOrders();
                        await get().fetchDashboardStats();
                        return { success: true, message: "Return approved successfully" };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            rejectReturn: async (orderId, reason) => {
                set({ loading: true });
                try {
                    const response = await api.put('/order/admin/reject-return', { orderId, reason });
                    if (response.data.success) {
                        await get().fetchOrders();
                        return { success: true, message: "Return rejected" };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            completeRefund: async (orderId, refundTransactionId) => {
                set({ loading: true });
                try {
                    const response = await api.put('/order/admin/complete-refund', { orderId, refundTransactionId });
                    if (response.data.success) {
                        await get().fetchOrders();
                        return { success: true, message: "Refund marked as completed" };
                    }
                    return { success: false, message: response.data.message };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message || error.message };
                } finally {
                    set({ loading: false });
                }
            },

            getOrderById: (id) => {
                return get().orders.find(o => o.id === id);
            },

            getStats: () => {
                const orders = get().orders;
                // Revenue only from delivered orders that are not cancelled/return-approved
                const revenueOrders = orders.filter(o =>
                    o.status?.toLowerCase() === 'delivered' &&
                    o.cancelApprovedByAdmin !== true &&
                    o.returnApprovedByAdmin !== true
                );
                return {
                    totalRevenue: revenueOrders.reduce((acc, curr) => acc + (curr.grandTotal || curr.total || 0), 0),
                    pendingOrders: orders.filter(o => o.status === 'Pending').length,
                    shippedOrders: orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length,
                    averageOrder: orders.length > 0 ? orders.reduce((acc, curr) => acc + (curr.total || 0), 0) / orders.length : 0,
                    pendingCancelRequests: orders.filter(o => o.cancelRequestedAt && o.cancelApprovedByAdmin === null).length,
                    pendingReturnRequests: orders.filter(o => o.returnRequestedAt && o.returnApprovedByAdmin === null).length,
                    pendingRefunds: orders.filter(o => o.refundStatus === 'Processing').length
                };
            }
        }),
        {
            name: 'admin-order-storage',
        }
    )
);

