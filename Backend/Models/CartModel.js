import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    color: {
      type: String,
      default: null
    },
    image: {
      type: String,
    }
  },
  { timestamps: true }
);

// ensure a user cannot have duplicate product in cart with same color
cartSchema.index({ userId: 1, productId: 1, color: 1 }, { unique: true });

export default mongoose.model("Cart", cartSchema);
