import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
        color: { type: String },
        image: { type: String }
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
    },

    // =================== CANCEL FIELDS ===================
    cancelReason: { type: String },
    cancelRequestedAt: { type: Date },
    cancelApprovedByAdmin: { type: Boolean, default: null }, // null = pending, true = approved, false = rejected
    cancelAdminResponse: { type: String }, // Admin's response/reason for rejection
    cancelProcessedAt: { type: Date },

    // =================== RETURN FIELDS ===================
    returnReason: {
      type: String,
      enum: ["Wrong Product Delivered", "Defective / Damaged Product", null],
      default: null
    },
    returnRequestedAt: { type: Date },
    returnApprovedByAdmin: { type: Boolean, default: null }, // null = pending, true = approved, false = rejected
    returnAdminResponse: { type: String }, // Admin's response/reason for rejection
    returnProcessedAt: { type: Date },

    // =================== REFUND FIELDS ===================
    refundStatus: {
      type: String,
      enum: ["NotRequired", "Pending", "Processing", "Completed", "Rejected"],
      default: "NotRequired"
    },
    refundDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      upiId: { type: String },
      refundMethod: { type: String, enum: ["Bank Transfer", "UPI", "Original Payment Method", null] }
    },
    refundAmount: { type: Number, default: 0 },
    refundProcessedAt: { type: Date },
    refundTransactionId: { type: String },

    // Track if stock was restored (to prevent double restore)
    stockRestored: { type: Boolean, default: false }
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
