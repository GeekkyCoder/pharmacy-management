const Invoice = require("../../models/invoice")

const asyncWrapper = require("../../middlewares/async-wrapper");

const getAllInvoices = asyncWrapper(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};

  if (search) {
    query.C_Name = { $regex: search, $options: "i" };
  }

  if(user.role === "admin") {
     query.admin = user._id;
  }else if(user.role === "employee") {
     query.admin = user.admin;
  }


  const totalInvoices = await Invoice.countDocuments(query);

  const invoices = await Invoice.find(query)
    .populate("employee", "userName role")
    .populate("items.med")
    .sort({ createdAt: -1 })             
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const medIds = invoices?.flatMap(invoice =>
      invoice.items.map(item => item.med._id)
    );

  return res.status(200).json({
    success: true,
    total: invoices.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalInvoices / limit),
    data: {invoices:invoices, medIds},
  });
});

module.exports = {
    getAllInvoices
}