const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  discountName: {
    type: String,
    required: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number, // For percentage discounts, this sets a cap
    min: 0
  },
  applicableCategories: [{
    type: String,
    trim: true
  }],
  applicableMedicines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Med'
  }],
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true });

// Index for better query performance
discountSchema.index({ admin: 1, isActive: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual to check if discount is currently valid
discountSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
});

// Method to calculate discount amount
discountSchema.methods.calculateDiscount = function(amount) {
  if (!this.isCurrentlyValid) {
    return 0;
  }
  
  if (amount < this.minimumAmount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (amount * this.discountValue) / 100;
    if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
      discountAmount = this.maximumDiscount;
    }
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discountValue;
    if (discountAmount > amount) {
      discountAmount = amount;
    }
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Discount', discountSchema);
