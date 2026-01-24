import Wishlist from "../Models/WishlistModel.js";

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const { id } = req.user;

        // check if already in wishlist
        const exists = await Wishlist.findOne({ userId: id, productId });
        if (exists)
            return res.status(400).json({ success: false, message: "Product already in wishlist" });

        const wishlistItem = await Wishlist.create({ userId: id, productId });

        res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            wishlistItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const deleted = await Wishlist.findOneAndDelete({ userId: req.user.id, productId });

        if (!deleted)
            return res.status(404).json({ success: false, message: "Product not found in wishlist" });

        res.json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GET USER WISHLIST ================= */
export const getWishlist = async (req, res) => {
    try {
        const { id } = req.user;

        const wishlistItems = await Wishlist.find({ userId: id }).populate({
            path: "productId",
            populate: { path: "categoryId" }
        });

        res.json({
            success: true,
            total: wishlistItems.length,
            wishlist: wishlistItems,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
