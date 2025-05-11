const Invoice = require("../../models/invoice")

const asyncWrapper = require("../../middlewares/async-wrapper");

const getAllInvoices = asyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};

  if (search) {
    query.C_Name = { $regex: search, $options: "i" };
  }

  const totalInvoices = await Invoice.countDocuments(query);

  const invoices = await Invoice.find(query)
    .populate("employee", "E_Username E_Fname E_Lname")
    .populate("items.med")
    .sort({ createdAt: -1 })             
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res.status(200).json({
    success: true,
    total: totalInvoices,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalInvoices / limit),
    data: invoices,
  });
});

module.exports = {
    getAllInvoices
}