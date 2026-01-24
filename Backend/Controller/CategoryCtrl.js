import Category from "../Models/CategoryModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../Cloudinary/CloudinaryHelper.js";


// ================= CREATE CATEGORY =================
export const createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    const exists = await Category.findOne({ categoryName });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
        data: null
      });
    }

    let imageData = {};

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "categories");
      imageData = {
        image: uploadResult.url,
        imagePublicId: uploadResult.public_id
      };
    }

    const category = await Category.create({
      categoryName,
      description,
      ...imageData
    });

    res.json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};


// ================= GET ALL =================
export const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Categories fetched successfully",
    data: categories
  });
};


// ================= GET BY ID =================
export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
      data: null
    });
  }

  res.json({
    success: true,
    message: "Category fetched successfully",
    data: category
  });
};


// ================= UPDATE =================
export const updateCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null
      });
    }

    if (req.file) {
      // delete old image
      if (category.imagePublicId) {
        await deleteFromCloudinary(category.imagePublicId);
      }

      // upload new image
      const uploadResult = await uploadToCloudinary(req.file.buffer, "categories");

      category.image = uploadResult.url;
      category.imagePublicId = uploadResult.public_id;
    }

    category.categoryName = categoryName || category.categoryName;
    category.description = description || category.description;

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};


// ================= DELETE =================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null
      });
    }

    // delete cloudinary image
    if (category.imagePublicId) {
      await deleteFromCloudinary(category.imagePublicId);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
      data: null
    });

  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};
