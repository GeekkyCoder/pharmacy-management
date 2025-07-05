const { createCustomError } = require("../../errors");
const asyncWrapper = require("../../middlewares/async-wrapper");
const Med = require("../../models/medicine");

const getAllMedicines = asyncWrapper(async (req, res, next) => {
    const { page = 1, limit = 10, search = "", category } = req.query;
  

    const query = {};
  
    if (search) {
      query.Med_Name = { $regex: search, $options: "i" };
    }
  
    // Fetching medicines
    const meds = await Med.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  
    const total = await Med.countDocuments(query);
  
    res.status(200).json({
      success: true,
      data: meds,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  });
  
const getMedicineById = asyncWrapper(async (req, res, next) => {
  const med = await Med.findById(req.params?.medicineId);

  if (!med) {
    return next(createCustomError("Medicine not found", 404));
  }

  res.status(200).json(med);
});

// Update Medicine
const updateMedicine = asyncWrapper(async (req, res, next) => {
  const med = await Med.findByIdAndUpdate(req.params?.medicineId, req.body, {
    new: true,
  });
  if (!med) {
    return next(createCustomError("Medcicine not fount", 404));
  }
  res.status(200).json({ message: "Medicine updated successfully", med });
});

const deleteMedicine = asyncWrapper(async (req, res, next) => {
  const med = await Med.findByIdAndDelete(req.params?.medicineId);

  if (!med) {
    return res.status(404).json({ message: "Medicine not found" });
  }

  res.status(200).json({ message: "Medicine deleted successfully" });
});


const restockMedicine = asyncWrapper(async (req, res, next) => {
  const medData = req.body;

  console.log("medData", medData);

  if (!medData?._id) {
    return next(createCustomError("Medicine does not exist", 400));
  }

  const updatedMed = await Med.findByIdAndUpdate(medData?._id, medData, {
    new: true,
    runValidators: true,
  });

  if (!updatedMed) {
    return next(createCustomError(`Medicine not found with ID: ${medData?._id}`, 404));
  }

  return res.status(200).json({
    success: true,
    message: "Medicine updated successfully.",
    data: updatedMed,
  });
});

module.exports = {
  getAllMedicines,
  getMedicineById,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  restockMedicine,
};
