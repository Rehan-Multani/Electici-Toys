import ShippingAddress from "../Models/ShippingAddressModel.js";

/* ================= ADD ADDRESS ================= */
export const addAddress = async (req, res) => {
  try {
    const { isDefault } = req.body;

    // if new address is default, reset previous default
    if (isDefault) {
      await ShippingAddress.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await ShippingAddress.create({ ...req.body, userId: req.user._id });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;

    if (isDefault) {
      await ShippingAddress.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await ShippingAddress.findByIdAndUpdate(id, { ...req.body, userId: req.user._id }, { new: true });

    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    res.json({ success: true, message: "Address updated", address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ShippingAddress.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Address not found" });

    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET USER ADDRESSES ================= */
export const getAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.find({ userId: req.user._id }).sort({ isDefault: -1 });

    res.json({ success: true, total: addresses.length, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
