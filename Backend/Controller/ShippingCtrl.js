import ShippingSlab from "../Models/ShippingSlabModel.js";
import ShippingSettings from "../Models/ShippingSettingsModel.js";

/* ================= SHIPPING SETTINGS ================= */

// Get shipping settings
export const getShippingSettings = async (req, res) => {
    try {
        const settings = await ShippingSettings.getSettings();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update shipping settings
export const updateShippingSettings = async (req, res) => {
    try {
        const { freeShippingEnabled, codEnabled, codCharge } = req.body;

        let settings = await ShippingSettings.findOne();
        if (!settings) {
            settings = new ShippingSettings();
        }

        if (typeof freeShippingEnabled === "boolean") {
            settings.freeShippingEnabled = freeShippingEnabled;
        }
        if (typeof codEnabled === "boolean") {
            settings.codEnabled = codEnabled;
        }
        if (typeof codCharge === "number" && codCharge >= 0) {
            settings.codCharge = codCharge;
        }

        await settings.save();
        res.json({ success: true, message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= SHIPPING SLABS ================= */

// Get all shipping slabs
export const getShippingSlabs = async (req, res) => {
    try {
        const slabs = await ShippingSlab.find().sort({ minAmount: 1 });
        res.json({ success: true, slabs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate slab overlap
const validateSlabOverlap = async (minAmount, maxAmount, excludeId = null) => {
    const query = { status: "active" };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existingSlabs = await ShippingSlab.find(query);

    for (const slab of existingSlabs) {
        const slabMin = slab.minAmount;
        const slabMax = slab.maxAmount;

        // Check for overlap
        // New slab range: [minAmount, maxAmount]
        // Existing slab range: [slabMin, slabMax]

        // If maxAmount is null (no upper limit)
        if (maxAmount === null || maxAmount === undefined) {
            // Check if new slab starts within existing range
            if (slabMax === null) {
                // Both have no upper limit - overlap if new min >= existing min
                if (minAmount >= slabMin) return true;
            } else {
                // New has no limit, existing has limit
                // Overlap if new min <= existing max
                if (minAmount <= slabMax) return true;
            }
        } else {
            // maxAmount has a value
            if (slabMax === null) {
                // Existing has no upper limit
                // Overlap if new max >= existing min
                if (maxAmount >= slabMin) return true;
            } else {
                // Both have upper limits
                // Standard overlap check
                if (minAmount <= slabMax && maxAmount >= slabMin) return true;
            }
        }
    }

    return false;
};

// Create shipping slab
export const createShippingSlab = async (req, res) => {
    try {
        const { minAmount, maxAmount, shippingCharge, status = "active" } = req.body;

        // Validation
        if (minAmount === undefined || minAmount < 0) {
            return res.status(400).json({ success: false, message: "Min amount is required and must be >= 0" });
        }
        if (shippingCharge === undefined || shippingCharge < 0) {
            return res.status(400).json({ success: false, message: "Shipping charge is required and must be >= 0" });
        }
        if (maxAmount !== null && maxAmount !== undefined && maxAmount <= minAmount) {
            return res.status(400).json({ success: false, message: "Max amount must be greater than min amount" });
        }

        // Check for overlap
        const hasOverlap = await validateSlabOverlap(minAmount, maxAmount);
        if (hasOverlap && status === "active") {
            return res.status(400).json({ success: false, message: "Slab range overlaps with an existing active slab" });
        }

        const slab = await ShippingSlab.create({
            minAmount,
            maxAmount: maxAmount || null,
            shippingCharge,
            status
        });

        res.status(201).json({ success: true, message: "Shipping slab created successfully", slab });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update shipping slab
export const updateShippingSlab = async (req, res) => {
    try {
        const { id } = req.params;
        const { minAmount, maxAmount, shippingCharge, status } = req.body;

        const slab = await ShippingSlab.findById(id);
        if (!slab) {
            return res.status(404).json({ success: false, message: "Shipping slab not found" });
        }

        // Prepare update values
        const newMinAmount = minAmount !== undefined ? minAmount : slab.minAmount;
        const newMaxAmount = maxAmount !== undefined ? maxAmount : slab.maxAmount;
        const newStatus = status !== undefined ? status : slab.status;

        // Validation
        if (newMaxAmount !== null && newMaxAmount <= newMinAmount) {
            return res.status(400).json({ success: false, message: "Max amount must be greater than min amount" });
        }

        // Check for overlap (exclude current slab)
        if (newStatus === "active") {
            const hasOverlap = await validateSlabOverlap(newMinAmount, newMaxAmount, id);
            if (hasOverlap) {
                return res.status(400).json({ success: false, message: "Slab range overlaps with an existing active slab" });
            }
        }

        // Update fields
        if (minAmount !== undefined) slab.minAmount = minAmount;
        if (maxAmount !== undefined) slab.maxAmount = maxAmount;
        if (shippingCharge !== undefined) slab.shippingCharge = shippingCharge;
        if (status !== undefined) slab.status = status;

        await slab.save();
        res.json({ success: true, message: "Shipping slab updated successfully", slab });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete shipping slab
export const deleteShippingSlab = async (req, res) => {
    try {
        const { id } = req.params;

        const slab = await ShippingSlab.findByIdAndDelete(id);
        if (!slab) {
            return res.status(404).json({ success: false, message: "Shipping slab not found" });
        }

        res.json({ success: true, message: "Shipping slab deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= SHIPPING CALCULATION ================= */

// Calculate shipping for cart total
export const calculateShipping = async (req, res) => {
    try {
        const { cartTotal, paymentMethod = "ONLINE" } = req.body;

        if (cartTotal === undefined || cartTotal < 0) {
            return res.status(400).json({ success: false, message: "Cart total is required" });
        }

        const result = await getShippingCharges(cartTotal, paymentMethod);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to calculate shipping (can be used internally)
export const getShippingCharges = async (cartTotal, paymentMethod = "ONLINE") => {
    const settings = await ShippingSettings.getSettings();

    let shippingAmount = 0;
    let codCharge = 0;
    let isFreeShipping = false;

    // Check if free shipping is enabled globally
    if (settings.freeShippingEnabled) {
        isFreeShipping = true;
        return {
            subtotal: cartTotal,
            shippingAmount: 0,
            codCharge: 0,
            grandTotal: cartTotal,
            isFreeShipping: true,
            codEnabled: settings.codEnabled
        };
    }

    // Find applicable shipping slab
    const slab = await ShippingSlab.findOne({
        status: "active",
        minAmount: { $lte: cartTotal },
        $or: [
            { maxAmount: null },
            { maxAmount: { $gte: cartTotal } }
        ]
    }).sort({ minAmount: -1 });

    if (slab) {
        shippingAmount = slab.shippingCharge;
    }

    // Apply COD charge if applicable
    const isCOD = paymentMethod.toUpperCase() === "COD";
    if (isCOD && settings.codEnabled && settings.codCharge > 0) {
        codCharge = settings.codCharge;
    }

    const grandTotal = cartTotal + shippingAmount + codCharge;

    return {
        subtotal: cartTotal,
        shippingAmount,
        codCharge: isCOD ? codCharge : 0,
        grandTotal,
        isFreeShipping: false,
        codEnabled: settings.codEnabled,
        appliedSlab: slab ? {
            minAmount: slab.minAmount,
            maxAmount: slab.maxAmount,
            charge: slab.shippingCharge
        } : null
    };
};

// Get shipping info for checkout page (public)
export const getCheckoutShippingInfo = async (req, res) => {
    try {
        const settings = await ShippingSettings.getSettings();
        const slabs = await ShippingSlab.find({ status: "active" }).sort({ minAmount: 1 });

        res.json({
            success: true,
            freeShippingEnabled: settings.freeShippingEnabled,
            codEnabled: settings.codEnabled,
            codCharge: settings.codCharge,
            slabs: slabs.map(s => ({
                minAmount: s.minAmount,
                maxAmount: s.maxAmount,
                shippingCharge: s.shippingCharge
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
