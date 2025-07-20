const mongoose = require('mongoose');

const pharmacyInfoSchema = new mongoose.Schema({
  pharmacyName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Pakistan'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
  },
  businessHours: {
    monday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: true }
    }
  },
  services: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String, // URL or file path
    trim: true
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  taxInfo: {
    taxId: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    }
  },
  bankInfo: {
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true 
  }
}, { timestamps: true });

// Index for better query performance
// pharmacyInfoSchema.index({ admin: 1 });

module.exports = mongoose.model('PharmacyInfo', pharmacyInfoSchema);
