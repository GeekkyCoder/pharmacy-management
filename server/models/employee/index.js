const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    E_Username:String,
    E_Password:String,
    E_Fname: String,
    E_Lname: String,
    E_Sex: String,
    E_Phno: String,
    E_Jdate: Date,
    Role:{type:String,default:"employee"},
    Admin_ID: {type:mongoose.Schema.Types.ObjectId, ref:"Admin"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
