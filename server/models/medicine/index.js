const mongoose = require("mongoose");

const medSchema = new mongoose.Schema(
  {
    Med_Name: { type: String, required: true, index:true },
    Med_Qty: { type: Number, required: true },
    Med_Price: { type: Number, required: true },
    Med_Category: { type: String, index: true },
    Manufacture_Date: { type: Date, required: true },
    Expiry_Date: { type: Date, required: true },
    Purchase_Date: { type: Date, required: true },
    currentDiscount: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Discount",
      default: null
    }, 
    admin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Med", medSchema);
