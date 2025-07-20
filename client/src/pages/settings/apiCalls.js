import axiosInstance from '../../api/axios';
import moment from 'moment';

// Helper function to make API calls using your axios instance
const apiCall = (method, url, data = null) => {
  return axiosInstance({
    method,
    url,
    data,
  });
};

// Discount API calls
export const discountAPI = {
  // Get all discounts
  getAll: () => apiCall('get', '/discount'),
  
  // Get active discounts
  getActive: () => apiCall('get', '/discount/active'),
  
  // Get single discount
  getOne: (id) => apiCall('get', `/discount/${id}`),
  
  // Create discount
  create: (data) => apiCall('post', '/discount', data),
  
  // Update discount
  update: (id, data) => apiCall('put', `/discount/${id}`, data),
  
  // Delete discount
  delete: (id) => apiCall('delete', `/discount/${id}`),
  
  // Toggle discount status
  toggleStatus: (id) => apiCall('put', `/discount/toggle-status/${id}`),

  // Apply discount to medicine
  applyToMedicine: (data) => apiCall('post', '/discount/apply-to-medicine', data),
  
  // Calculate cart discount
  calculateCart: (data) => apiCall('post', '/discount/calculate-cart', data)
};

// Pharmacy Info API calls
export const pharmacyAPI = {
  // Get pharmacy info
  get: () => apiCall('get', '/pharmacy-info'),
  
  // Create pharmacy info
  create: (data) => apiCall('post', '/pharmacy-info', data),
  
  // Update pharmacy info
  update: (data) => apiCall('put', '/pharmacy-info', data),
  
  // Delete pharmacy info
  delete: () => apiCall('delete', '/pharmacy-info'),
  
  // Update business hours
  updateBusinessHours: (data) => apiCall('patch', '/pharmacy-info/business-hours', data),
  
  // Update contact info
  updateContactInfo: (data) => apiCall('patch', '/pharmacy-info/contact-info', data),
  
  // Toggle pharmacy status
  toggleStatus: () => apiCall('patch', '/pharmacy-info/toggle-status'),
  
  // Get public pharmacy info (no auth required)
  getPublic: (adminId) => apiCall('get', `/pharmacy-info/public/${adminId}`)
};

// Medicine API calls (for discount selection)
export const medicineAPI = {
  getAll: () => apiCall('get', '/medicine/getMedicines'),
  getCategories: () => apiCall('get', '/medicine/categories') // If this endpoint exists
};

// Helper functions for data formatting
export const formatDiscountData = (formData) => {
  const { validDates, ...rest } = formData;
  return {
    ...rest,
    validFrom: validDates[0].toISOString(),
    validUntil: validDates[1].toISOString(),
  };
};

export const formatPharmacyData = (formData) => {
  // Convert time picker values to string format
  const formatBusinessHours = (hours) => {
    if (!hours) return hours;
    
    const formatted = {};
    Object.keys(hours).forEach(day => {
      if (hours[day]) {
        formatted[day] = {
          ...hours[day],
          open: hours[day].open ? hours[day].open.format('HH:mm') : null,
          close: hours[day].close ? hours[day].close.format('HH:mm') : null,
        };
      }
    });
    return formatted;
  };

  return {
    ...formData,
    businessHours: formatBusinessHours(formData.businessHours)
  };
};

// Validation helpers
export const validateDiscount = (values) => {
  const errors = {};
  
  if (!values.discountName) {
    errors.discountName = 'Discount name is required';
  }
  
  if (!values.discountType) {
    errors.discountType = 'Discount type is required';
  }
  
  if (!values.discountValue || values.discountValue <= 0) {
    errors.discountValue = 'Discount value must be greater than 0';
  }
  
  if (values.discountType === 'percentage' && values.discountValue > 100) {
    errors.discountValue = 'Percentage discount cannot exceed 100%';
  }
  
  if (!values.validDates || values.validDates.length !== 2) {
    errors.validDates = 'Valid period is required';
  }
  
  if (values.validDates && values.validDates[0] >= values.validDates[1]) {
    errors.validDates = 'End date must be after start date';
  }
  
  return errors;
};

export const validatePharmacyInfo = (values) => {
  const errors = {};
  
  if (!values.pharmacyName) {
    errors.pharmacyName = 'Pharmacy name is required';
  }
  
  if (!values.ownerName) {
    errors.ownerName = 'Owner name is required';
  }
  
  if (!values.licenseNumber) {
    errors.licenseNumber = 'License number is required';
  }
  
  if (!values.address?.street) {
    errors['address.street'] = 'Street address is required';
  }
  
  if (!values.address?.city) {
    errors['address.city'] = 'City is required';
  }
  
  if (!values.contactInfo?.phone) {
    errors['contactInfo.phone'] = 'Phone number is required';
  }
  
  if (!values.contactInfo?.email) {
    errors['contactInfo.email'] = 'Email is required';
  }
  
  return errors;
};

// Data transformation helpers
export const transformDiscountForDisplay = (discount) => {
  return {
    ...discount,
    validDates: [
      moment(discount.validFrom),
      moment(discount.validUntil)
    ],
    displayValue: discount.discountType === 'percentage' 
      ? `${discount.discountValue}%` 
      : `PKR ${discount.discountValue}`,
    isCurrentlyValid: isDiscountValid(discount)
  };
};

export const transformPharmacyForDisplay = (pharmacy) => {
  if (!pharmacy) return null;
  
  // Convert string time values back to moment objects for form
  const formatBusinessHoursForForm = (hours) => {
    if (!hours) return hours;
    
    const formatted = {};
    Object.keys(hours).forEach(day => {
      if (hours[day]) {
        formatted[day] = {
          ...hours[day],
          open: hours[day].open ? moment(hours[day].open, 'HH:mm') : null,
          close: hours[day].close ? moment(hours[day].close, 'HH:mm') : null,
        };
      }
    });
    return formatted;
  };

  return {
    ...pharmacy,
    businessHours: formatBusinessHoursForForm(pharmacy.businessHours)
  };
};

// Utility functions
export const isDiscountValid = (discount) => {
  const now = new Date();
  return discount.isActive && 
         new Date(discount.validFrom) <= now && 
         new Date(discount.validUntil) >= now &&
         (discount.usageLimit === null || discount.usageCount < discount.usageLimit);
};

export const calculateDiscountAmount = (discount, amount) => {
  if (!isDiscountValid(discount) || amount < (discount.minimumAmount || 0)) {
    return 0;
  }
  
  let discountAmount = 0;
  
  if (discount.discountType === 'percentage') {
    discountAmount = (amount * discount.discountValue) / 100;
    if (discount.maximumDiscount && discountAmount > discount.maximumDiscount) {
      discountAmount = discount.maximumDiscount;
    }
  } else if (discount.discountType === 'fixed') {
    discountAmount = discount.discountValue;
    if (discountAmount > amount) {
      discountAmount = amount;
    }
  }
  
  return Math.round(discountAmount * 100) / 100;
};

// Constants
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' }
];

export const MEDICINE_CATEGORIES = [
  'Pain Relief',
  'Antibiotics', 
  'Heart Medication',
  'Diabetes Care',
  'Blood Pressure',
  'Cold & Flu',
  'Vitamins & Supplements',
  'Skin Care',
  'Eye Care',
  'Digestive Health'
];

export const PHARMACY_SERVICES = [
  'Prescription Medicines',
  'Over-the-Counter Drugs',
  'Health Consultations',
  'Blood Pressure Check',
  'Diabetes Monitoring',
  'Vaccination Services',
  'Medicine Delivery',
  'Health Screening',
  'First Aid Services',
  'Nutritional Counseling'
];

export default {
  discountAPI,
  pharmacyAPI,
  medicineAPI,
  formatDiscountData,
  formatPharmacyData,
  validateDiscount,
  validatePharmacyInfo,
  transformDiscountForDisplay,
  transformPharmacyForDisplay,
  isDiscountValid,
  calculateDiscountAmount,
  DISCOUNT_TYPES,
  MEDICINE_CATEGORIES,
  PHARMACY_SERVICES
};
