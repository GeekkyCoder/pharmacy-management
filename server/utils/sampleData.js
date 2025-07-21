// Sample data for testing discount and pharmacy info functionality
// This file can be used to seed the database with sample data

const sampleDiscounts = [
  {
    discountName: "Senior Citizen Discount",
    discountType: "percentage",
    discountValue: 10,
    description: "10% discount for senior citizens",
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    minimumAmount: 500,
    maximumDiscount: 1000,
    applicableCategories: ["Pain Relief", "Heart Medication"],
    usageLimit: null
  },
  {
    discountName: "Bulk Purchase Discount",
    discountType: "percentage",
    discountValue: 15,
    description: "15% discount on bulk purchases",
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    minimumAmount: 2000,
    maximumDiscount: 2000,
    applicableCategories: [],
    usageLimit: 100
  },
  {
    discountName: "New Year Special",
    discountType: "fixed",
    discountValue: 200,
    description: "Fixed PKR 200 discount for New Year",
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    minimumAmount: 1000,
    applicableCategories: [],
    usageLimit: 50
  }
];

const samplePharmacyInfo = {
  pharmacyName: "HealthCare Plus Pharmacy",
  ownerName: "Dr. Muhammad Ahmed",
  licenseNumber: "PH-2024-001234",
  address: {
    street: "123 Main Street, Block A",
    city: "Karachi",
    state: "Sindh",
    postalCode: "75300",
    country: "Pakistan"
  },
  contactInfo: {
    phone: "+92-21-1234567",
    email: "info@healthcareplus.pk",
    website: "https://healthcareplus.pk",
    fax: "+92-21-7654321"
  },
  businessHours: {
    monday: { open: "08:00", close: "22:00", isClosed: false },
    tuesday: { open: "08:00", close: "22:00", isClosed: false },
    wednesday: { open: "08:00", close: "22:00", isClosed: false },
    thursday: { open: "08:00", close: "22:00", isClosed: false },
    friday: { open: "08:00", close: "22:00", isClosed: false },
    saturday: { open: "09:00", close: "20:00", isClosed: false },
    sunday: { open: "10:00", close: "18:00", isClosed: false }
  },
  services: [
    "Prescription Medicines",
    "Over-the-Counter Drugs",
    "Health Consultations",
    "Blood Pressure Check",
    "Diabetes Monitoring",
    "Vaccination Services"
  ],
  description: "Your trusted neighborhood pharmacy providing quality healthcare solutions with 24/7 emergency services.",
  socialMedia: {
    facebook: "https://facebook.com/healthcareplus",
    instagram: "https://instagram.com/healthcareplus",
    twitter: "https://twitter.com/healthcareplus"
  },
  taxInfo: {
    taxId: "TAX-123456789",
    gstNumber: "GST-987654321"
  },
  isActive: true
};

const medicineCategories = [
  "Pain Relief",
  "Antibiotics",
  "Heart Medication",
  "Diabetes Care",
  "Blood Pressure",
  "Cold & Flu",
  "Vitamins & Supplements",
  "Skin Care",
  "Eye Care",
  "Digestive Health"
];

module.exports = {
  sampleDiscounts,
  samplePharmacyInfo,
  medicineCategories
};
