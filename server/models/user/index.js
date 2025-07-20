const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  role:{type:String,enum:["admin","employee"], default:"employee"}
},{ timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
