const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
  med: { type: mongoose.Schema.Types.ObjectId, ref: "Med" },
  P_Name: { type: String, required: true },
  P_Qty: { type: Number, required: true },
  P_Cost: { type: Number, required: true },
  // Category: { type: String, required: true },
  Mfg_Date: { type: Date, required: true },
  Exp_Date: { type: Date, required: true },
  Pur_Date: { type: Date, required: true },
});

const SupplierPurchaseSchema = new mongoose.Schema({
  Sup_Name: { type: String, required: true, index:true },
  Sup_Phno: { type: String, required: true },
  purchases: [PurchaseSchema],
  purchaseMadeBy:{type:mongoose.Schema.Types.ObjectId, ref:"Employee"},
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    // required: true 
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("SupplierPurchase", SupplierPurchaseSchema);
