const {
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  restockMedicine
} = require("../../controllers/medicine");
const { isAdmin } = require("../../middlewares/admin");
const { userAuth } = require("../../middlewares/auth");

const Router = require("express").Router();

Router.get("/getMedicines", userAuth, getAllMedicines);
Router.get("/getMedicine", userAuth, getMedicineById);
Router.post("/restock", [userAuth, isAdmin], restockMedicine);
Router.put("/updateMedicineRecords/:medicineId", [userAuth, isAdmin], updateMedicine);
Router.delete("/deleteMedicine/:medicineId", [userAuth, isAdmin], deleteMedicine);

module.exports = Router;
