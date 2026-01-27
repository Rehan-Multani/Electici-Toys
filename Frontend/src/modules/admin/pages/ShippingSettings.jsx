import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';
import {
    Truck,
    Package,
    DollarSign,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Zap,
    ToggleLeft,
    ToggleRight,
    Banknote,
    Settings,
    TrendingUp,
    Info
} from 'lucide-react';

export default function ShippingSettings() {
    // Global Settings State
    const [settings, setSettings] = useState({
        freeShippingEnabled: false,
        codEnabled: true,
        codCharge: 0
    });

    // Slabs State
    const [slabs, setSlabs] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Slab Form State
    const [showSlabForm, setShowSlabForm] = useState(false);
    const [editingSlabId, setEditingSlabId] = useState(null);
    const [slabForm, setSlabForm] = useState({
        minAmount: '',
        maxAmount: '',
        shippingCharge: '',
        status: 'active'
    });

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, slabsRes] = await Promise.all([
                api.get('/shipping/settings'),
                api.get('/shipping/slabs')
            ]);

            if (settingsRes.data.success) {
                setSettings(settingsRes.data.settings);
            }
            if (slabsRes.data.success) {
                setSlabs(slabsRes.data.slabs);
            }
        } catch (error) {
            showMessage('error', 'Failed to load shipping settings');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // Save Settings
    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await api.put('/shipping/settings', settings);
            if (res.data.success) {
                showMessage('success', 'Settings saved successfully!');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Slab CRUD operations
    const openSlabForm = (slab = null) => {
        if (slab) {
            setEditingSlabId(slab._id);
            setSlabForm({
                minAmount: slab.minAmount,
                maxAmount: slab.maxAmount || '',
                shippingCharge: slab.shippingCharge,
                status: slab.status
            });
        } else {
            setEditingSlabId(null);
            setSlabForm({
                minAmount: '',
                maxAmount: '',
                shippingCharge: '',
                status: 'active'
            });
        }
        setShowSlabForm(true);
    };

    const closeSlabForm = () => {
        setShowSlabForm(false);
        setEditingSlabId(null);
        setSlabForm({
            minAmount: '',
            maxAmount: '',
            shippingCharge: '',
            status: 'active'
        });
    };

    const saveSlab = async () => {
        const payload = {
            minAmount: Number(slabForm.minAmount),
            maxAmount: slabForm.maxAmount ? Number(slabForm.maxAmount) : null,
            shippingCharge: Number(slabForm.shippingCharge),
            status: slabForm.status
        };

        if (payload.minAmount < 0 || payload.shippingCharge < 0) {
            showMessage('error', 'Values must be positive numbers');
            return;
        }

        setSaving(true);
        try {
            let res;
            if (editingSlabId) {
                res = await api.put(`/shipping/slabs/${editingSlabId}`, payload);
            } else {
                res = await api.post('/shipping/slabs', payload);
            }

            if (res.data.success) {
                showMessage('success', editingSlabId ? 'Slab updated!' : 'Slab created!');
                fetchData();
                closeSlabForm();
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to save slab');
        } finally {
            setSaving(false);
        }
    };

    const deleteSlab = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shipping slab?')) return;

        try {
            const res = await api.delete(`/shipping/slabs/${id}`);
            if (res.data.success) {
                showMessage('success', 'Slab deleted!');
                fetchData();
            }
        } catch (error) {
            showMessage('error', 'Failed to delete slab');
        }
    };

    const toggleSlabStatus = async (slab) => {
        const newStatus = slab.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await api.put(`/shipping/slabs/${slab._id}`, { status: newStatus });
            if (res.data.success) {
                fetchData();
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                        <Truck className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Shipping Settings
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium italic">Configure shipping charges and delivery options</p>
                </div>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <span className="font-bold text-sm">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Settings Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                            <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Global Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {/* Free Shipping Toggle */}
                        <div className="bg-background/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-border/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                                        <h3 className="font-bold uppercase tracking-wide text-xs md:text-sm">Free Shipping</h3>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                                        Enable to offer FREE shipping on all orders. Shipping slabs and COD charges will be ignored.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, freeShippingEnabled: !settings.freeShippingEnabled })}
                                    className={`relative w-14 h-7 md:w-16 md:h-8 rounded-full transition-all duration-300 ${settings.freeShippingEnabled ? 'bg-emerald-500' : 'bg-muted'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.freeShippingEnabled ? 'left-8 md:left-9' : 'left-1'
                                        }`}></div>
                                </button>
                            </div>
                            {settings.freeShippingEnabled && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600">
                                    <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Free shipping is active for all orders</span>
                                </div>
                            )}
                        </div>

                        {/* COD Settings */}
                        <div className="bg-background/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 mb-4">
                                <Banknote className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                                <h3 className="font-bold uppercase tracking-wide text-xs md:text-sm">Cash on Delivery (COD)</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs md:text-sm font-medium">Enable COD Charge</span>
                                    <button
                                        onClick={() => setSettings({ ...settings, codEnabled: !settings.codEnabled })}
                                        className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-all duration-300 ${settings.codEnabled ? 'bg-primary' : 'bg-muted'
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.codEnabled ? 'left-6.5 md:left-7' : 'left-0.5'
                                            }`}></div>
                                    </button>
                                </div>

                                {settings.codEnabled && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            COD Extra Charge (₹)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={settings.codCharge}
                                                onChange={(e) => setSettings({ ...settings, codCharge: Number(e.target.value) || 0 })}
                                                className="w-full h-10 md:h-12 pl-8 md:pl-10 pr-4 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary/30 font-bold text-base md:text-lg"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-muted-foreground">This charge applies only when customer selects COD</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 md:mt-8 flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-full font-black italic uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Save className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                            Save Settings
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Shipping Slabs Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Shipping Slabs</h2>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Define shipping charges based on order amount</p>
                        </div>
                    </div>

                    <button
                        onClick={() => openSlabForm()}
                        className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-xl hover:scale-105 transition-all"
                    >
                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> Add Slab
                    </button>
                </div>

                {/* Info Banner */}
                {settings.freeShippingEnabled && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-start gap-3">
                        <Info className="h-4 w-4 md:h-5 md:w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs md:text-sm font-bold text-amber-600">Free Shipping is Active</p>
                            <p className="text-[10px] md:text-xs text-amber-600/80">These slabs are currently bypassed because global free shipping is enabled.</p>
                        </div>
                    </div>
                )}

                {/* Slabs Table */}
                {slabs.length === 0 ? (
                    <div className="text-center py-12 md:py-16 bg-secondary/5 rounded-2xl border border-dashed border-secondary/30">
                        <Package className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium text-sm md:text-base">No shipping slabs defined yet</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Add slabs to define shipping charges based on order amount</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-5 md:mx-0 px-5 md:px-0">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Order Range</th>
                                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Shipping Charge</th>
                                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="text-right py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slabs.map((slab, index) => (
                                    <motion.tr
                                        key={slab._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-border/30 hover:bg-secondary/5 transition-colors"
                                    >
                                        <td className="py-3 md:py-4 px-3 md:px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm md:text-lg">₹{slab.minAmount.toLocaleString()}</span>
                                                <span className="text-muted-foreground text-xs md:text-sm">to</span>
                                                <span className="font-black text-sm md:text-lg">
                                                    {slab.maxAmount ? `₹${slab.maxAmount.toLocaleString()}` : '∞'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full font-black text-sm md:text-lg">
                                                ₹{slab.shippingCharge.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                                            <button
                                                onClick={() => toggleSlabStatus(slab)}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${slab.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                    }`}
                                            >
                                                {slab.status === 'active' ? (
                                                    <><ToggleRight className="h-3.5 w-3.5 md:h-4 md:w-4" /> Active</>
                                                ) : (
                                                    <><ToggleLeft className="h-3.5 w-3.5 md:h-4 md:w-4" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openSlabForm(slab)}
                                                    className="p-2 md:p-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSlab(slab._id)}
                                                    className="p-2 md:p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Slab Form Modal */}
            <AnimatePresence>
                {showSlabForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={closeSlabForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card border border-border/50 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <h3 className="text-lg md:text-xl font-black italic tracking-tight uppercase">
                                    {editingSlabId ? 'Edit Slab' : 'Add Shipping Slab'}
                                </h3>
                                <button
                                    onClick={closeSlabForm}
                                    className="p-2 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                >
                                    <X className="h-4 w-4 md:h-5 md:w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Min Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={slabForm.minAmount}
                                            onChange={(e) => setSlabForm({ ...slabForm, minAmount: e.target.value })}
                                            className="w-full h-10 md:h-12 px-3 md:px-4 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary/30 font-bold text-sm md:text-base"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Max Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={slabForm.maxAmount}
                                            onChange={(e) => setSlabForm({ ...slabForm, maxAmount: e.target.value })}
                                            className="w-full h-10 md:h-12 px-3 md:px-4 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary/30 font-bold text-sm md:text-base"
                                            placeholder="No limit"
                                        />
                                        <p className="text-[9px] md:text-[10px] text-muted-foreground">Leave empty for no upper limit</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Shipping Charge (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={slabForm.shippingCharge}
                                            onChange={(e) => setSlabForm({ ...slabForm, shippingCharge: e.target.value })}
                                            className="w-full h-10 md:h-12 pl-8 md:pl-10 pr-4 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary/30 font-bold text-base md:text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Status
                                    </label>
                                    <div className="flex gap-3 md:gap-4">
                                        <button
                                            onClick={() => setSlabForm({ ...slabForm, status: 'active' })}
                                            className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${slabForm.status === 'active'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                                                }`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => setSlabForm({ ...slabForm, status: 'inactive' })}
                                            className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${slabForm.status === 'inactive'
                                                ? 'bg-muted text-foreground'
                                                : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                                                }`}
                                        >
                                            Inactive
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={saveSlab}
                                    disabled={saving || !slabForm.minAmount || !slabForm.shippingCharge}
                                    className="w-full h-12 md:h-14 bg-primary text-primary-foreground rounded-full font-black italic uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 md:h-5 md:w-5" />
                                            {editingSlabId ? 'Update Slab' : 'Create Slab'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
