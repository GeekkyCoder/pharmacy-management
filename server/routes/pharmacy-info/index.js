const express = require('express');
const router = express.Router();
const {
  getPharmacyInfo,
  createPharmacyInfo,
  updatePharmacyInfo,
  deletePharmacyInfo,
  getPublicPharmacyInfo,
  updateBusinessHours,
  updateContactInfo,
  togglePharmacyStatus
} = require('../../controllers/pharmacy-info');
const { userAuth } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/admin');


router.get('/public/:adminId', getPublicPharmacyInfo);

router.use(userAuth);


router.get('/', getPharmacyInfo);

// Admin-only routes
router.post('/', isAdmin, createPharmacyInfo);
router.put('/', isAdmin, updatePharmacyInfo);
router.delete('/', isAdmin, deletePharmacyInfo);
router.patch('/business-hours', isAdmin, updateBusinessHours);
router.patch('/contact-info', isAdmin, updateContactInfo);
router.patch('/toggle-status', isAdmin, togglePharmacyStatus);

module.exports = router;
