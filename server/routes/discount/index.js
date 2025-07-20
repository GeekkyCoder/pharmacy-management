const express = require('express');
const router = express.Router();
const {
  getAllDiscounts,
  getActiveDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscountToMedicine,
  calculateCartDiscount,
  toggleDiscountStatus
} = require('../../controllers/discount');
const { userAuth } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/admin');


router.use(userAuth);

// routes accessible by both admin and employees
router.get('/active', getActiveDiscounts);
router.post('/calculate-cart', userAuth, calculateCartDiscount);

// admin-only routes
router.get('/', isAdmin, getAllDiscounts);
router.post('/', isAdmin, createDiscount);
router.delete('/:id', isAdmin, deleteDiscount);
router.get('/:id', isAdmin, getDiscount);
router.put('/toggle-status/:id', isAdmin, toggleDiscountStatus);
router.post('/apply-to-medicine', userAuth, applyDiscountToMedicine);
router.put('/:id', isAdmin, updateDiscount);
module.exports = router;
