import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],

    // Subtotal of all products (sum of product totals)
    totalAmount: { type: Number, required: true },

    // Shipping charges at time of order (immutable after order placed)
    shippingAmount: { type: Number, default: 0 },

    // COD extra charge at time of order (immutable after order placed)
    codCharge: { type: Number, default: 0 },

    // Final total = totalAmount + shippingAmount + codCharge
    grandTotal: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Pending"
    },

    paymentMethod: {
      type: String,
      default: "RAZORPAY"
    },

    transactionId: { type: String },
    orderId: { type: String }, // payment gateway order id

    shippingAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingAddress",
      required: true
    },

    shippingAddress: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zip: { type: String }
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    statusTimestamps: {
      pending: { type: Date },
      processing: { type: Date },
      shipped: { type: Date },
      delivered: { type: Date },
      cancelled: { type: Date }
    }
  },
  { timestamps: true }
);

// auto update initial status timestamp
orderSchema.pre("save", function () {
  if (!this.statusTimestamps.pending) {
    this.statusTimestamps.pending = new Date();
  }
});

export default mongoose.model("Order", orderSchema);
