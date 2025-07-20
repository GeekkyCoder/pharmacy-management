const mongoose = require("mongoose");

const medSchema = new mongoose.Schema({
    med:{type:mongoose.Schema.Types.ObjectId, ref:"Med"},
    Med_Name: {type:String, required:true},
    Med_Qty: { type: Number, required: true },
    Med_Price: { type: Number, required: true }
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {type:String},
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    C_Name: { type: String, required: true },
    C_ID: { type: String, required: true },
    No_Of_Items: { type: Number, required: true },
    items: [medSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
