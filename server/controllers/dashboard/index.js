const asyncWrapper = require("../../middlewares/async-wrapper");
const Med = require("../../models/medicine");
const SalesItem = require("../../models/sale-items");

const getDashboardSummary = asyncWrapper(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  const [
    totalMedicines,
    outOfStock,
    lowStock,
    expired,
    expiringSoon,
    todaysSales,
    topSelling,
  ] = await Promise.all([
    Med.countDocuments(),
    Med.find({ Med_Qty: { $lte: 0 } }),
    Med.find({ Med_Qty: { $lte: 10 } }).sort({ Med_Qty: 1 }),
    Med.find({ Expiry_Date: { $lt: new Date() } }),
    Med.find({ Expiry_Date: { $gte: new Date(), $lte: nextMonth } }),
    SalesItem.aggregate([
      {
        $match: {
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
    SalesItem.aggregate([
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
        $project: {
          Med_Name: "$medInfo.Med_Name",
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    totalMedicines,
    outOfStock,
    lowStock,
    expired,
    expiringSoon,
    todaysSales: todaysSales[0] || { totalRevenue: 0, count: 0 },
    topSelling,
  });
});

module.exports = {
    getDashboardSummary
}