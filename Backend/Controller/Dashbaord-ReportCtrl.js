import ProductModel from "../Models/ProductModel.js";
import OrderModel from "../Models/OrderModel.js";

/* ================= DASHBOARD ================= */

export const getDashboard = async (req, res) => {
  try {

    // Total Revenue (All except cancelled)
    const totalRevenueResult = await OrderModel.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total Orders count
    const totalOrders = await OrderModel.countDocuments({ orderStatus: { $ne: "cancelled" } });

    // Active Products
    const activeProducts = await ProductModel.countDocuments({
      isActive: true,
      isPublished: true,
      isDeleted: false
    });

    // Avg Order Value
    const avgOrderResult = await OrderModel.aggregate([
      { $group: { _id: null, avg: { $avg: "$totalAmount" } } }
    ]);
    const avgOrderValue = avgOrderResult[0]?.avg || 0;

    // Recent Orders
    const recentOrdersRaw = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email");

    const recentOrders = recentOrdersRaw.map(order => ({
      orderId: order.orderId,
      customerName: order.shippingAddress?.name || order.userId?.fullName || order.userId?.name || "Guest",
      email: order.shippingAddress?.email || order.userId?.email || "",
      totalAmount: order.totalAmount,
      grandTotal: order.grandTotal,
      shippingAmount: order.shippingAmount,
      codCharge: order.codCharge,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      products: order.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        total: p.total
      }))
    }));

    // Best Selling Products
    const bestSelling = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.productName",
          sellingPrice: "$product.sellingPrice",
          totalSold: 1,
          image: { $arrayElemAt: ["$product.images", 0] }
        }
      }
    ]);

    res.status(200).json({
      totalRevenue,
      totalOrders,
      activeProducts,
      avgOrderValue,
      recentOrders,
      bestSelling
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ================= ANALYTICS REPORT ================= */

export const analyticsReport = async (req, res) => {
  try {

    // Monthly Revenue (All except cancelled)
    const monthlyRevenue = await OrderModel.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format for frontend
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
      year: item._id.year,
      month: item._id.month,
      totalRevenue: item.totalRevenue,
      totalOrders: item.totalOrders
    }));


    // Top Customers
    const topCustomers = await OrderModel.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          totalSpent: 1,
          totalOrders: 1
        }
      }
    ]);

    res.status(200).json({
      monthlyRevenue: formattedMonthlyRevenue,
      topCustomers
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
