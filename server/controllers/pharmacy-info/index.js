const asyncWrapper = require('../../middlewares/async-wrapper');
const PharmacyInfo = require('../../models/pharmacy-info');

// Get pharmacy info
const getPharmacyInfo = asyncWrapper(async (req, res) => {
  const { user } = req;

  if(user?.role === "employee") {
     user._id = user.admin;
  }
  
  const pharmacyInfo = await PharmacyInfo.findOne({ admin: user._id });
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found. Please set up your pharmacy details.'
    });
  }
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo
  });
});


const createPharmacyInfo = asyncWrapper(async (req, res) => {
  const { user } = req;
  
  const existingInfo = await PharmacyInfo.findOne({ admin: user._id });
  if (existingInfo) {
    return res.status(400).json({
      success: false,
      message: 'Pharmacy information already exists. Use update endpoint to modify.'
    });
  }
  
  const pharmacyInfo = await PharmacyInfo.create({
    ...req.body,
    admin: user._id
  });
  
  res.status(201).json({
    success: true,
    data: pharmacyInfo,
    message: 'Pharmacy information created successfully'
  });
});


const updatePharmacyInfo = asyncWrapper(async (req, res) => {
  const { user } = req;
  
  try{
  const pharmacyInfo = await PharmacyInfo.findOneAndUpdate(
    { admin: user._id },
    req.body,
    { new: true, runValidators: true, upsert: true }
  );
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo,
    message: 'Pharmacy information updated successfully'
  });
  }catch(err) {
    console.log('err', err)
    return res.status(500).json({message:err.message})
  }

});


const deletePharmacyInfo = asyncWrapper(async (req, res) => {
  const { user } = req;
  
  const pharmacyInfo = await PharmacyInfo.findOneAndDelete({ admin: user.id });
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Pharmacy information deleted successfully'
  });
});

// Get public pharmacy info (for customers/external use)
const getPublicPharmacyInfo = asyncWrapper(async (req, res) => {
  const { adminId } = req.params;
  
  const pharmacyInfo = await PharmacyInfo.findOne({ 
    admin: adminId, 
    isActive: true 
  }).select('-admin -bankInfo -taxInfo -createdAt -updatedAt');
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo
  });
});

// Update business hours
const updateBusinessHours = asyncWrapper(async (req, res) => {
  const { user } = req;
  const { businessHours } = req.body;
  
  if (!businessHours) {
    return res.status(400).json({
      success: false,
      message: 'Business hours data is required'
    });
  }
  
  const pharmacyInfo = await PharmacyInfo.findOneAndUpdate(
    { admin: user._id },
    { businessHours },
    { new: true, runValidators: true }
  );
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo,
    message: 'Business hours updated successfully'
  });
});

// Update contact info
const updateContactInfo = asyncWrapper(async (req, res) => {
  const { user } = req;
  const { contactInfo } = req.body;
  
  if (!contactInfo) {
    return res.status(400).json({
      success: false,
      message: 'Contact information is required'
    });
  }
  
  const pharmacyInfo = await PharmacyInfo.findOneAndUpdate(
    { admin: user._id },
    { contactInfo },
    { new: true, runValidators: true }
  );
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo,
    message: 'Contact information updated successfully'
  });
});

// Toggle pharmacy status
const togglePharmacyStatus = asyncWrapper(async (req, res) => {
  const { user } = req;
  
  const pharmacyInfo = await PharmacyInfo.findOne({ admin: user._id });
  
  if (!pharmacyInfo) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy information not found'
    });
  }
  
  pharmacyInfo.isActive = !pharmacyInfo.isActive;
  await pharmacyInfo.save();
  
  res.status(200).json({
    success: true,
    data: pharmacyInfo,
    message: `Pharmacy ${pharmacyInfo.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

module.exports = {
  getPharmacyInfo,
  createPharmacyInfo,
  updatePharmacyInfo,
  deletePharmacyInfo,
  getPublicPharmacyInfo,
  updateBusinessHours,
  updateContactInfo,
  togglePharmacyStatus
};
