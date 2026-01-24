import Order from "../Models/OrderModel.js";
import Product from "../Models/ProductModel.js";
import ShippingAddress from "../Models/ShippingAddressModel.js";
import RazorpayInstance from "../Config/razorpay.js";
import crypto from "crypto";
import { getShippingCharges } from "./ShippingCtrl.js";
import { createNotificationHelper } from "./NotificationCtrl.js";
import { sendEmail } from "../Helpers/emailHelper.js";


/* ================= PLACE ORDER ================= */
export const placeOrder = async (req, res) => {
  try {
    const { products, shippingAddressId, paymentMethod = "Razorpay" } = req.body;

    // Validate input
    if (!shippingAddressId) return res.status(400).json({ success: false, message: "shippingAddressId is required" });
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products array is required and cannot be empty" });
    }

    // Fetch product details from DB and calculate subtotal
    let totalAmount = 0;
    const orderProducts = await Promise.all(products.map(async (p, i) => {
      const product = await Product.findById(p.productId);
      if (!product) throw new Error(`Product not found at index ${i}`);

      const price = Number(product.sellingPrice);
      const quantity = Number(p.quantity);

      if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        throw new Error(`Invalid price or quantity for product at index ${i}`);
      }

      const total = price * quantity;
      totalAmount += total;

      return {
        productId: product._id,
        quantity,
        price,
        total
      };
    }));

    // Calculate shipping charges
    const normalizedPaymentMethod = paymentMethod.toUpperCase();
    const isCOD = normalizedPaymentMethod === "COD";
    const shippingResult = await getShippingCharges(totalAmount, normalizedPaymentMethod);

    const shippingAmount = shippingResult.shippingAmount;
    const codCharge = isCOD ? shippingResult.codCharge : 0;
    const grandTotal = totalAmount + shippingAmount + codCharge;

    // Create Razorpay order if payment method is Online
    let razorpayOrderId = null;
    const isOnlinePayment = normalizedPaymentMethod === "RAZORPAY" || normalizedPaymentMethod === "CARD" || normalizedPaymentMethod === "ONLINE";

    if (isOnlinePayment) {
      if (grandTotal <= 0) {
        return res.status(400).json({ success: false, message: "Total amount must be greater than 0" });
      }

      const options = {
        amount: Math.round(grandTotal * 100), // paisa
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      };

      const razorpayOrder = await RazorpayInstance.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }

    // Fetch shipping address details for snapshot
    const address = await ShippingAddress.findById(shippingAddressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Shipping address not found" });
    }

    // Create order in DB with shipping details
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAmount,
      codCharge,
      grandTotal,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "Pending",
      orderId: razorpayOrderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shippingAddressId,
      shippingAddress: {
        name: address.name,
        email: address.email,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        country: address.country,
        zip: address.zip
      }
    });

    // Notify Admin
    createNotificationHelper({
      title: "New Order Placed",
      message: `Order ${order.orderId} placed by ${req.user.name || 'User'}`,
      type: "order",
      isAdmin: true
    }, req.io);

    // Notify User via Socket
    createNotificationHelper({
      userId: req.user._id,
      title: "Order Placed Successfully",
      message: `Your order ${order.orderId} has been placed.`,
      type: "order"
    }, req.io);

    // Notify User via Email
    if (req.user.email) {
      sendEmail(
        req.user.email,
        "Order Confirmation - Electrycity Toys",
        `<h1>Order Placed!</h1><p>Your order <b>${order.orderId}</b> has been placed successfully.</p><p>Total: ₹${grandTotal}</p>`
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      shippingInfo: {
        subtotal: totalAmount,
        shippingAmount,
        codCharge,
        grandTotal,
        isFreeShipping: shippingResult.isFreeShipping
      }
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({ success: false, message: error.message || error });
  }
};

/* ================= VERIFY PAYMENT (RAZORPAY) ================= */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const order = await Order.findOne({ orderId: razorpay_order_id });
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Log for debugging
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    // Compare signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Payment is verified
    order.paymentStatus = "Paid";
    order.transactionId = razorpay_payment_id;
    order.orderStatus = "processing";
    order.statusTimestamps.processing = new Date();

    await order.save();

    // Notify Admin
    createNotificationHelper({
      title: "Payment Received",
      message: `Payment received for order ${order.orderId}`,
      type: "order",
      isAdmin: true
    }, req.io);

    // Notify User
    createNotificationHelper({
      userId: order.userId,
      title: "Payment Successful",
      message: `We received your payment for order ${order.orderId}. We are processing it now!`,
      type: "order"
    }, req.io);

    // Notify User via Email (Fetching user email from order doesn't have it directly if only userId is stored... wait, order has userId, which needs population, OR we use shippingAddress email)
    // Order model doesn't populate userId here.
    // However, I can use shippingAddress.email which is stored in Order.
    if (order.shippingAddress && order.shippingAddress.email) {
      sendEmail(
        order.shippingAddress.email,
        "Payment Received - Electrycity Toys",
        `<h1>Payment Received!</h1><p>We received your payment for order <b>${order.orderId}</b>.</p>`
      );
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= GET ALL ORDERS ================= */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId").populate("products.productId").populate("shippingAddressId").sort({ createdAt: -1 });
    res.json({ success: true, total: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET ORDER BY ID ================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("products.productId")
      .populate("shippingAddressId");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET USER ORDERS ================= */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("products.productId")
      .populate("shippingAddressId")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE ORDER STATUS ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    // Validate status (case-insensitive check maybe? validStatuses are lowercase)
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    // Normalize status to lowercase for check
    const normalizedStatus = newStatus.toLowerCase();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    // Use findById for robustness (frontend sends _id)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = order.orderStatus;

    // Status flow rules (optional: stricter checks/allow admin override)
    // For now, keeping checks but strictly lowercase
    // ... logic ...

    // Simple update for now to unblock admin
    order.orderStatus = normalizedStatus;

    // Add timestamp
    if (!order.statusTimestamps) {
      order.statusTimestamps = {};
    }

    order.statusTimestamps[normalizedStatus] = new Date();
    await order.save();

    // Notify User
    createNotificationHelper({
      userId: order.userId,
      title: "Order Status Update",
      message: `Your order ${order.orderId} is now ${normalizedStatus}.`,
      type: "order"
    }, req.io);

    if (order.shippingAddress && order.shippingAddress.email) {
      sendEmail(
        order.shippingAddress.email,
        `Order ${normalizedStatus} - Electrycity Toys`,
        `<h1>Order Update</h1><p>Your order <b>${order.orderId}</b> is now <b>${normalizedStatus}</b>.</p>`
      );
    }

    res.json({
      success: true,
      message: `Order status updated from '${currentStatus}' to '${normalizedStatus}'`,
      order
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = "cancelled";
    if (!order.statusTimestamps) order.statusTimestamps = {};
    order.statusTimestamps.cancelled = new Date();

    await order.save();


    createNotificationHelper({
      title: "Order Cancelled",
      message: `Order ${order.orderId} was cancelled by user`,
      type: "order",
      isAdmin: true
    }, req.io);

    res.json({ success: true, message: "Order cancelled successfully", order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


