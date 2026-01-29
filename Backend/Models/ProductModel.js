import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },

    actualPrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String, // image URL
      },
    ],

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: [],
    },
    variants: [
      {
        color: { type: String, required: true },
        images: [String],
        // specific details per variant if needed later
      }
    ],
    reviews: [
      {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        email: { type: String }, // To link to user if needed, or just for guest
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false // Optional for now if guest reviews are allowed
        },
        images: [String],
        verified: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
