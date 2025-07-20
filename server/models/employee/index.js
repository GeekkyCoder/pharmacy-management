const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    index: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  admin:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role:{type:String, default:"employee"}
},{ timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
