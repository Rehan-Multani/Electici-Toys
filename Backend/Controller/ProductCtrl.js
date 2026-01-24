import Product from "../Models/ProductModel.js";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js";

/* ================= CREATE PRODUCT ================= */
export const createProduct = async (req, res) => {
  try {

    const existingProduct = await Product.findOne({
      $or: [
        { productName: req.body.productName },
        { sku: req.body.sku } // agar SKU bhi use kar rahe ho
      ]
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product name or SKU already exists",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        imageUrls.push(result.url);
      }
    }

    // Handle specifications
    let specifications = req.body.specifications;
    if (specifications && typeof specifications === 'string') {
      try {
        // Ensure it's stored as an array of strings (where the first element is the JSON)
        // This matches the current fetch logic in getAllProducts/getProductById
        specifications = [specifications];
      } catch (e) {
        specifications = [];
      }
    }

    const productData = {
      ...req.body,
      images: imageUrls,
      specifications: specifications
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const productsRaw = await Product.find()
      .populate("categoryId")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    // Clean specifications
    const products = productsRaw.map(product => {
      let specs = [];

      if (Array.isArray(product.specifications) && product.specifications.length > 0) {
        try {
          specs = JSON.parse(product.specifications[0]); // string to object
        } catch (err) {
          specs = [];
        }
      }

      return {
        ...product.toObject(),
        specifications: specs
      };
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      products,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET SINGLE PRODUCT ================= */
export const getProductById = async (req, res) => {
  try {
    const productRaw = await Product.findById(req.params.id)
      .populate("categoryId");

    if (!productRaw)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Clean specifications
    let specs = [];
    if (Array.isArray(productRaw.specifications) && productRaw.specifications.length > 0) {
      try {
        specs = JSON.parse(productRaw.specifications[0]); // string -> object
      } catch (err) {
        specs = [];
      }
    }

    const product = {
      ...productRaw.toObject(),
      specifications: specs
    };

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    let newImages = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        newImages.push(result.url);
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // append new images
    if (newImages.length > 0) {
      product.images = [...product.images, ...newImages];
    }

    // Handle specifications separately to ensure correct format
    if (req.body.specifications) {
      if (typeof req.body.specifications === 'string') {
        product.specifications = [req.body.specifications];
      } else {
        product.specifications = req.body.specifications;
      }
      delete req.body.specifications;
    }

    // update other fields
    Object.assign(product, req.body);

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= DELETE PRODUCT (HARD DELETE) ================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: "Product permanently deleted from database",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CREATE PRODUCT REVIEW ================= */
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment, name, email, images } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = {
      name: name || "Anonymous",
      rating: Number(rating),
      comment,
      email,
      images: images || [],
      user: req.user ? req.user._id : null,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: "Review added", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
