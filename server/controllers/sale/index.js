const SalesItem = require("../../models/sale-items");
const Invoice = require("../../models/invoice");
const Med = require("../../models/medicine");
const asyncWrapper = require("../../middlewares/async-wrapper");

const createSaleAndInvoice = asyncWrapper(async (req, res) => {
  try {
    const user = req.user;
    
    if (user?.role !== "employee") {
      return res.status(403).json({ message: "Only employees can create sales" });
    }

 
    const adminId = user.admin;
    const employeeId = user._id;

    
    if (!adminId) {
      return res.status(400).json({ message: "Employee must be assigned to an admin" });
    }

    const {
      C_Name,
      C_ID,
      totalPrice,
      medicines,
      No_Of_Items,
      items,
      invoiceId,
    } = req.body;

    
    if (!C_Name || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        message: "Customer name and medicines are required"
      });
    }

 
    for (let med of medicines) {
      const foundMed = await Med.findById(med.Med_ID);
      if (!foundMed) {
        return res.status(404).json({
          message: `Medicine not found with ID: ${med.Med_ID}`,
        });
      }

      if (foundMed.Med_Qty < med.Sale_Qty) {
        return res.status(400).json({
          message: `Not enough stock for medicine: ${foundMed.Med_Name}. Available: ${foundMed.Med_Qty}, Requested: ${med.Sale_Qty}`,
        });
      }

     
      foundMed.Med_Qty -= med.Sale_Qty;
      await foundMed.save();
    }

    
    const newSale = new SalesItem({
      C_Name,
      C_ID,
      medicines,
      employeeId: employeeId,
      admin: adminId,
      Total_Price: totalPrice,
      NO_Of_Items: No_Of_Items, 
    });

    await newSale.save();

    
    const newInvoice = new Invoice({
      invoiceId,
      C_Name,
      C_ID,
      employee: employeeId,
      admin: adminId,
      No_Of_Items,
      items,
    });

    await newInvoice.save();

    return res.status(201).json({
      success: true,
      message: "Sale, Invoice Created and Stock Updated!",
      sale: newSale,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error in createSaleAndInvoice:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

const getAllSales = asyncWrapper(async (req, res) => {

  const user = req.user;

  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};

  if (user?.role === "admin") { 
    query.admin = user._id;
  } else if (user?.role === "employee") {
    query.admin = user.admin;
  } else {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  if (search) {
    query.C_Name = { $regex: search, $options: "i" };
  }

  const totalSales = await SalesItem.countDocuments(query);

  const sales = await SalesItem.find(query)
    .populate("employeeId", "userName email role")
    .populate("medicines.Med_ID")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res.status(200).json({
    success: true,
    total: totalSales,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalSales / limit),
    data: sales,
  });
});

const getSalesReport = asyncWrapper(async (req, res, next) => {

  const user = req.user;

  const { startDate, endDate, page = 1 } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start date and end date are required" });
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  if (start > end) {
    return res.status(400).json({ message: "Start date must be before end date" });
  }

  const skip = (page - 1) * 10;

  // Initialize query object
  const query = {};

  if (user.role === "employee") {
    query.admin = user.admin;
  } else if (user.role === "admin") {
    query.admin = user._id;
  } else {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const totalDocs = await SalesItem.countDocuments({
    ...query,
    createdAt: { $gte: start, $lte: end },
  });

  const sales = await SalesItem.find({
    ...query,
    createdAt: { $gte: start, $lte: end },
  })
    .populate("employeeId", "userName role")
    .populate("medicines.Med_ID")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10);

  return res.status(200).json({
    success: true,
    message: "Sales fetched successfully",
    data: {
      docs: sales,
      totalDocsLength: totalDocs,
      totalPages: Math.ceil(totalDocs / 10),
      page: parseInt(page),
    },
  });
});



module.exports = {
  getAllSales,
  getSalesReport,
  createSaleAndInvoice,
};
