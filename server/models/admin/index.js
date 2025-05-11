const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  A_Username: String,
  A_Password: String,
  A_Token:String,
  Role:{type:String,default:"admin"}
},{ timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
