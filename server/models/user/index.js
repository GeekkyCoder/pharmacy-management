const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  role:{type:String, default:"admin"},
  active: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  }
},{ timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
