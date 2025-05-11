const mongoose = require("mongoose");

const medSchema = new mongoose.Schema(
  {
    Med_Name: { type: String, required: true },
    Med_Qty: { type: Number, required: true },
    Med_Price: { type: Number, required: true },
    Manufacture_Date: { type: Date, required: true },
    Expiry_Date: { type: Date, required: true },
    Purchase_Date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Med", medSchema);
