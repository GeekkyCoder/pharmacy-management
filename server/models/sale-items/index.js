const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  Med_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Med", required: true },
  Sale_Qty: { type: Number, required: true },
});

const salesItemSchema = new mongoose.Schema({
  C_Name: { type: String, required: true }, 
  C_ID: {type:String},
  medicines: [medicineSchema],            
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  Total_Price: { type: Number },    
  NO_Of_Items: {type:Number},
},{timestamps:true});

module.exports = mongoose.model("SalesItem", salesItemSchema);
