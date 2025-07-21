const asyncWrapper = require("../../middlewares/async-wrapper");
const Med = require("../../models/medicine");

const getAllMedicines = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10, search = "", category } = req.query;
  
    const user = req.user;

    const query = {}
    if(user?.role === "admin") {
      query.admin = user._id;
    } else if(user.role === "employee") {
       query.admin = user?.admin
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (search) {
      query.Med_Name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.Category = category;
    }
  
    const meds = await Med.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }).populate("currentDiscount"); 
  
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

  const user = req.user;

  const med = await Med.findOne({ _id: req.params?.medicineId, admin: user._id });

  if (!med) {
    return res.status(404).json({ message: "Medicine not found in Inventory" });
  }

  res.status(200).json(med);
});

// Update Medicine
const updateMedicine = asyncWrapper(async (req, res, next) => {
  const user = req.user;

  const med = await Med.findOneAndUpdate({ _id: req.params?.medicineId, admin: user._id }, req.body, {
    new: true,
  });
  if (!med) {
    return res.status(404).json({ message: "Medicine not found in Inventory" });
    // return next(createCustomError("Medicine not found", 404));
  }
  res.status(200).json({ message: "Medicine updated successfully", med });
});

const deleteMedicine = asyncWrapper(async (req, res, next) => {
  const user = req.user;

  const med = await Med.findOneAndDelete({ _id: req.params?.medicineId, admin: user._id });

  if (!med) {
    return res.status(404).json({ message: "Medicine not found" });
  }

  res.status(200).json({ message: "Medicine deleted successfully" });
});


const restockMedicine = asyncWrapper(async (req, res, next) => {
  const medData = req.body;

  const user = req.user;

  if (!medData?._id) {
    return res.status(400).json({ message: "Medicine ID is required for restocking" });
  }

  const updatedMed = await Med.findByIdAndUpdate({_id: medData?._id, admin: user._id}, medData, {
    new: true,
    runValidators: true,
  });

  if (!updatedMed) {
    return res.status(404).json({ message: "Medicine not found in Inventory" });
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
