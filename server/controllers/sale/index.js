const SalesItem = require("../../models/sale-items");
const Invoice = require("../../models/invoice");
const Med = require("../../models/medicine");
const asyncWrapper = require("../../middlewares/async-wrapper");
const { createCustomError } = require("../../errors");
const moment = require("moment");

const createSaleAndInvoice = asyncWrapper(async (req, res, next) => {
  const {
    C_Name,
    C_ID,
    employeeId,
    totalPrice,
    medicines,
    No_Of_Items,
    items,
    invoiceId,
  } = req.body;

  for (let med of medicines) {
    const foundMed = await Med.findById(med.Med_ID);
    if (!foundMed) {
      return next(
        createCustomError(`Medicine not found with ID: ${med.Med_ID}`, 404)
      );
    }

    if (foundMed.Med_Qty < med.Sale_Qty) {
      return next(
        createCustomError(
          `Not enough stock for medicine: ${foundMed.Med_Name}`
        ),
        404
      );
    }

    foundMed.Med_Qty -= med.Sale_Qty;
    await foundMed.save();
  }

  const newSale = new SalesItem({
    C_Name,
    C_ID,
    medicines,
    employeeId,
    Total_Price: totalPrice,
    No_Of_Items,
  });

  await newSale.save();

  const newInvoice = new Invoice({
    invoiceId,
    C_Name,
    C_ID,
    employee: employeeId,
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
});

const getAllSales = asyncWrapper(async (req, res,next) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};

  if (search) {
    query.C_Name = { $regex: search, $options: "i" };
  }

  const totalSales = await SalesItem.countDocuments(query);

  const sales = await SalesItem.find(query)
    .populate("employeeId", "E_Username E_Fname E_Lname")
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


// const getSalesReport = asyncWrapper(async (req, res, next) => {
//   const { startDate, endDate } = req.body;

  

//   if (!startDate || !endDate) {
//     return next(createCustomError("Start date and end date are required", 400));
//   }

//   const start = new Date(`${startDate}T00:00:00.000Z`);
//   const end = new Date(`${endDate}T23:59:59.999Z`);

//   if (start > end) {
//     return next(createCustomError("Start date must be before end date", 400));
//   }

//   const sales = await SalesItem.find({
//     createdAt: {
//       $gte: start,
//       $lte: end,
//     },
//   })
//     .populate("employeeId", "E_Username E_Fname E_Lname")
//     .populate("medicines.Med_ID")
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     success: true,
//     total: sales.length,
//     data: sales,
//   });
// });


const getSalesReport = asyncWrapper(async (req, res, next) => {
  const { startDate, endDate, page = 1 } = req.body;

  if (!startDate || !endDate) {
    return next(createCustomError("Start date and end date are required", 400));
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  if (start > end) {
    return next(createCustomError("Start date must be before end date", 400));
  }

  const skip = (page - 1) * 10;

  const totalDocs = await SalesItem.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const sales = await SalesItem.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("employeeId", "E_Username E_Fname E_Lname")
    .populate("medicines.Med_ID")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10);

  return res.status(200).json({
    success: true,
    message: "Sales fetched successfully",
    data: {
      docs: sales,
      totalDocsLength:totalDocs,
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
