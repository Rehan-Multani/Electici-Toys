import mongoose from "mongoose";

const shippingSlabSchema = new mongoose.Schema(
  {
    minAmount: {
      type: Number,
      required: true,
      min: 0
    },
    maxAmount: {
      type: Number,
      default: null // NULL means no upper limit
    },
    shippingCharge: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Index for faster slab queries
shippingSlabSchema.index({ minAmount: 1, maxAmount: 1, status: 1 });

export default mongoose.model("ShippingSlab", shippingSlabSchema);
