const SupplierPurchase = require("../../models/sale-purchase");
const Med = require("../../models/medicine");
const asyncWrapper = require("../../middlewares/async-wrapper");

const createSupplierPurchase = asyncWrapper(async (req, res) => {
  try {
    const { Sup_Name, Sup_Phno, purchases, purchaseMadeBy } = req.body;

    // Save supplier purchase record
    const supplierPurchase = new SupplierPurchase({
      Sup_Name,
      Sup_Phno,
      purchases,
      purchaseMadeBy,
    });

    await supplierPurchase.save();

    // Update Med inventory for each purchase
    for (const item of purchases) {
      const existingMed = await Med.findOne({
        Med_Name: item.P_Name,
        // Category: item.Category,
      });

      if (existingMed) {
        // Update quantity
        existingMed.Med_Qty += item.P_Qty;
        existingMed.Med_Price = item.P_Cost;
        existingMed.Manufacture_Date = item.Mfg_Date;
        existingMed.Expiry_Date = item.Exp_Date;
        existingMed.Purchase_Date = item.Pur_Date;

        await existingMed.save();
      } else {
        // Create new med
        const newMed = new Med({
          Med_Name: item.P_Name,
          Med_Qty: item.P_Qty,
          Med_Price: item.P_Cost,
          Category: item.Category,
          Manufacture_Date: item.Mfg_Date,
          Expiry_Date: item.Exp_Date,
          Purchase_Date: item.Pur_Date,
        });

        await newMed.save();
      }
    }

    res.status(201).json({
      message: "Supplier purchase recorded and inventory updated successfully.",
      data: supplierPurchase,
    });
  } catch (error) {
    console.error("Purchase Error:", error);
    res.status(500).json({ error: "Failed to process purchase." });
  }
});

const getSuppliersAndPurchase = asyncWrapper(async (req,res,next) => {
  const { page = 1, limit = 5, Sup_Name, ...otherFilters } = req.query;

  const filter = {};

  if (Sup_Name) {
    filter.Sup_Name = { $regex: Sup_Name, $options: "i" }; // case-insensitive search
  }

  for (const key in otherFilters) {
    filter[key] = otherFilters[key];
  }

  const purchases = await SupplierPurchase.find(filter)
    .populate("purchases.med")
    .populate("purchaseMadeBy")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await SupplierPurchase.countDocuments(filter);

  res.status(200).json({
    data: purchases,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalRecords: total,
  });
});


const getSupplierInfoByMedId = asyncWrapper(async (req,res,next) => {
    const {medName} = req.params
    console.log('here', medName)
    const result = await SupplierPurchase.aggregate([
      { 
        $unwind: "$purchases"  
      },
      {
        $match: { 
          "purchases.P_Name": medName
        }
      },
      {
        $project: {
          _id: 0,
          Sup_Name: 1,
          Sup_Phno: 1
        }
      }
    ]);

    console.log('result', result)

    if (result.length > 0) {
      
      return res.status(200).json({supplierDetails:result[0]})
    } else {
      return res.status(404).json({message:"oops"})
    }
})



module.exports = {
  createSupplierPurchase,
  getSuppliersAndPurchase,
  getSupplierInfoByMedId
};
