import Product from "../Models/ProductModel.js";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js";

/* ================= CREATE PRODUCT ================= */
export const createProduct = async (req, res) => {
  try {

    const existingProduct = await Product.findOne({
      $or: [
        { productName: req.body.productName },
        { sku: req.body.sku }
      ]
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product name or SKU already exists",
      });
    }

    let allImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        allImageUrls.push(result.url);
      }
    }

    // Handle specifications
    let specifications = req.body.specifications;
    if (specifications && typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = []; }
    }

    // Handle Variants
    let variants = [];
    if (req.body.variants) {
      try {
        const parsedVariants = JSON.parse(req.body.variants); // Expecting [{ color: 'Red', imageCount: 2 }]
        let currentImgIdx = 0;

        variants = parsedVariants.map(v => {
          const variantImages = allImageUrls.slice(currentImgIdx, currentImgIdx + (v.imageCount || 0));
          currentImgIdx += (v.imageCount || 0);
          return {
            color: v.color,
            images: variantImages
          };
        });

        // If there are leftover images (or main images uploaded separately without variants), 
        // they stay in 'allImageUrls' but maybe we want to assign them to 'images' field?
        // Let's keep 'images' field as a fallback or collection of all images.

      } catch (e) {
        variants = [];
      }
    }

    const productData = {
      ...req.body,
      images: allImageUrls, // Keep all images in main array as well for backward compatibility
      specifications: specifications,
      variants: variants
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

    // Append new images to main array
    if (newImages.length > 0) {
      product.images = [...product.images, ...newImages];
    }

    // Handle specifications
    if (req.body.specifications) {
      // ... existing logic ...
      if (typeof req.body.specifications === 'string') {
        // Try parse to array if it is notably JSON
        try {
          const parsed = JSON.parse(req.body.specifications);
          if (Array.isArray(parsed)) product.specifications = parsed;
          else product.specifications = [req.body.specifications];
        } catch (e) {
          product.specifications = [req.body.specifications];
        }
      } else {
        product.specifications = req.body.specifications;
      }
      delete req.body.specifications;
    }

    // Handle Variants Update
    if (req.body.variants) {
      try {
        const parsedVariants = JSON.parse(req.body.variants);
        let currentNewImgIdx = 0;

        const updatedVariants = parsedVariants.map(v => {
          // If variant has 'imageCount' > 0, it means it expects new images from the upload batch
          let variantImages = v.images || []; // start with existing

          if (v.imageCount && v.imageCount > 0) {
            const newBatch = newImages.slice(currentNewImgIdx, currentNewImgIdx + v.imageCount);
            variantImages = [...variantImages, ...newBatch];
            currentNewImgIdx += v.imageCount;
          }

          return {
            color: v.color,
            images: variantImages
          };
        });

        product.variants = updatedVariants;
      } catch (e) {
        console.error("Variant update error", e);
      }
      delete req.body.variants;
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
