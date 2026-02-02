import Product from "../Models/ProductModel.js";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js";

/* ================= CREATE PRODUCT ================= */
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

    // IDK why but sometimes specifications/variants come as ["[...]"] (double encoded) or just "[...]"
    const parseMixedData = (data) => {
      try {
        if (!data) return [];
        if (typeof data === 'string') return JSON.parse(data);
        if (Array.isArray(data)) {
          if (data.length === 0) return [];
          // Check if it is a single string that contains JSON
          if (data.length === 1 && typeof data[0] === 'string') {
            try {
              const parsed = JSON.parse(data[0]);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If parse fails, maybe it's just a regular string array?
              // Try parsing it as individual json items if they look like objects?
            }
          }
          // Check if it's an array of JSON strings
          if (typeof data[0] === 'string') {
            return data.map(item => {
              try { return JSON.parse(item); } catch (e) { return item; }
            });
          }
          return data;
        }
        return [];
      } catch (e) {
        console.error("Parsing error", e);
        return [];
      }
    };

    // Handle specifications
    let specifications = parseMixedData(req.body.specifications);

    // Handle Variants
    let variants = [];
    if (req.body.variants) {
      try {
        const parsedVariants = parseMixedData(req.body.variants);
        let currentImgIdx = 0;

        variants = parsedVariants.map(v => {
          const variantObj = (typeof v === 'string') ? JSON.parse(v) : v;

          let variantImages = Array.isArray(variantObj.images) ? variantObj.images : [];
          const count = Number(variantObj.imageCount) || 0;

          if (count > 0) {
            const mapped = allImageUrls.slice(currentImgIdx, currentImgIdx + count);
            variantImages = [...variantImages, ...mapped];
          }
          currentImgIdx += count;

          return {
            color: variantObj.color || "Default",
            images: variantImages
          };
        });
      } catch (e) {
        console.error("Variant processing error:", e);
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
        const first = product.specifications[0];
        if (typeof first === "string") {
          try {
            specs = JSON.parse(first);
          } catch {
            specs = [];
          }
        } else if (typeof first === "object") {
          specs = product.specifications;
        } else {
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
      const first = productRaw.specifications[0];
      if (typeof first === "string") {
        try {
          const parsed = JSON.parse(first);
          if (Array.isArray(parsed)) specs = parsed;
          else specs = productRaw.specifications;
        } catch {
          specs = productRaw.specifications;
        }
      } else {
        specs = productRaw.specifications;
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

    // IDK why but sometimes specifications/variants come as ["[...]"] (double encoded) or just "[...]"
    const parseMixedData = (data) => {
      try {
        if (!data) return [];
        if (typeof data === 'string') return JSON.parse(data);
        if (Array.isArray(data)) {
          if (data.length === 0) return [];
          // Check if it is a single string that contains JSON
          if (data.length === 1 && typeof data[0] === 'string') {
            try {
              const parsed = JSON.parse(data[0]);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If parse fails, maybe it's just a regular string array?
            }
          }
          // Check if it's an array of JSON strings
          if (typeof data[0] === 'string') {
            return data.map(item => {
              try { return JSON.parse(item); } catch (e) { return item; }
            });
          }
          return data;
        }
        return [];
      } catch (e) {
        console.error("Parsing error", e);
        return [];
      }
    };

    // Handle specifications
    if (req.body.specifications) {
      product.specifications = parseMixedData(req.body.specifications);
      delete req.body.specifications;
    }

    // Handle Variants Update
    if (req.body.variants) {
      try {
        const parsedVariants = parseMixedData(req.body.variants);
        let currentNewImgIdx = 0;

        const updatedVariants = parsedVariants.map(v => {
          const variantObj = (typeof v === 'string') ? JSON.parse(v) : v;

          let variantImages = Array.isArray(variantObj.images) ? variantObj.images : [];
          const count = Number(variantObj.imageCount) || 0;

          if (count > 0) {
            const newBatch = newImages.slice(currentNewImgIdx, currentNewImgIdx + count);
            variantImages = [...variantImages, ...newBatch];
            currentNewImgIdx += count;
          }

          return {
            color: variantObj.color || "Default",
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
