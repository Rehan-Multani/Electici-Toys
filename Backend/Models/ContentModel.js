import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true, // e.g., 'home', 'about', 'contact'
    },
    data: {
      type: Object, // Stores the entire JSON structure for the page
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
