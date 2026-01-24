import Cart from "../Models/CartModel.js";

/* ================= ADD TO CART ================= */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // check if product already in cart
    let cartItem = await Cart.findOne({ userId: req.user.id, productId });

    if (cartItem) {
      // increase quantity
      cartItem.quantity = Number(cartItem.quantity) + quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({ userId: req.user.id, productId, quantity });
    }

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REMOVE FROM CART ================= */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const deleted = await Cart.findOneAndDelete({ userId: req.user.id, productId });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Product not found in cart" });

    res.json({ success: true, message: "Product removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user.id });

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id }).populate("productId");

    res.json({
      success: true,
      totalItems: cartItems.length,
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
