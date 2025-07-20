const asyncWrapper = require("../../middlewares/async-wrapper");
const Med = require("../../models/medicine");
const SalesItem = require("../../models/sale-items");
const User = require("../../models/user");

const getDashboardSummary = asyncWrapper(async (req, res) => {
  try {
    const admin = req.user;

    if(admin.role === "employee") {
       return res.status(401).json({message:"employee cant access dashboards"})
    }

    console.log("Admin details:", admin);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    // Filter medicines by admin
    const adminFilter = { admin: admin._id };

    const [
      totalMedicines,
      outOfStock,
      lowStock,
      expired,
      expiringSoon,
      todaysSales,
      topSelling,
    ] = await Promise.all([
      // Total medicines for this admin
      Med.countDocuments(adminFilter),
      
      // Out of stock medicines for this admin
      Med.find({ ...adminFilter, Med_Qty: { $lte: 0 } }),
      
      // Low stock medicines for this admin (<=10 items)
      Med.find({ ...adminFilter, Med_Qty: { $lte: 10 } }).sort({ Med_Qty: 1 }),
      
      // Expired medicines for this admin
      Med.find({ ...adminFilter, Expiry_Date: { $lt: new Date() } }),
      
      // Medicines expiring soon for this admin
      Med.find({ 
        ...adminFilter, 
        Expiry_Date: { $gte: new Date(), $lte: nextMonth } 
      }),
      
      // Today's sales for this admin
      SalesItem.aggregate([
        {
          $match: {
            admin: admin._id,
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$Total_Price" },
            count: { $sum: 1 },
          },
        },
      ]),
      
      // Top selling medicines for this admin
      SalesItem.aggregate([
        {
          $match: {
            admin: admin._id,
          },
        },
        { $unwind: "$medicines" },
        {
          $group: {
            _id: "$medicines.Med_ID",
            totalSold: { $sum: "$medicines.Sale_Qty" },
          },
        },
        {
          $lookup: {
            from: "meds",
            localField: "_id",
            foreignField: "_id",
            as: "medInfo",
          },
        },
        { $unwind: "$medInfo" },
        {
          $match: {
            "medInfo.admin": admin._id,
          },
        },
        {
          $project: {
            Med_Name: "$medInfo.Med_Name",
            totalSold: 1,
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Calculate additional metrics
    const totalStockValue = await Med.aggregate([
      { $match: adminFilter },
      {
        $group: {
          _id: null,
          totalValue: { 
            $sum: { 
              $multiply: ["$Med_Qty", "$Med_Price"] 
            } 
          },
        },
      },
    ]);

    // Get monthly sales trend for this admin
    const monthlySales = await SalesItem.aggregate([
      {
        $match: {
          admin: admin._id,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$Total_Price" },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        adminInfo: {
          id: admin._id,
          name: admin.userName,
          email: admin.email,
        },
        totalMedicines,
        outOfStock: {
          count: outOfStock.length,
          medicines: outOfStock,
        },
        lowStock: {
          count: lowStock.length,
          medicines: lowStock,
        },
        expired: {
          count: expired.length,
          medicines: expired,
        },
        expiringSoon: {
          count: expiringSoon.length,
          medicines: expiringSoon,
        },
        todaysSales: todaysSales[0] || { totalRevenue: 0, count: 0 },
        topSelling,
        totalStockValue: totalStockValue[0]?.totalValue || 0,
        monthlySales,
        lastUpdated: new Date(),
      },
      message: "Dashboard data fetched successfully",
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
});

module.exports = {
    getDashboardSummary
}