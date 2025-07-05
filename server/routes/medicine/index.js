const {
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  restockMedicine
} = require("../../controllers/medicine");

const Router = require("express").Router();

Router.get("/getMedicines", getAllMedicines);
Router.get("/getMedicine", getMedicineById);
Router.post("/restock", restockMedicine);
Router.put("/updateMedicineRecords/:medicineId", updateMedicine);
Router.delete("/deleteMedicine/:medicineId", deleteMedicine);

module.exports = Router;
