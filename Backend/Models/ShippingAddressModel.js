import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zip: { type: String, required: true },
        isDefault: { type: Boolean, default: false } // default address
    },
    { timestamps: true }
);

export default mongoose.model("ShippingAddress", shippingAddressSchema);
