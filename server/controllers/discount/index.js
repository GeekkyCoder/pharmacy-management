
const Discount = require('../../models/discount');
const Medicine = require('../../models/medicine');
const asyncWrapper = require('../../middlewares/async-wrapper');

// Get all discounts for admin
const getAllDiscounts = asyncWrapper(async (req, res) => {
    const { user } = req;

    const discounts = await Discount.find({ admin: user._id })
        .populate('applicableMedicines', 'Med_Name Med_Price')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: discounts,
        count: discounts.length
    });
});

// Get active discounts
const getActiveDiscounts = asyncWrapper(async (req, res) => {
    const { user } = req;
    const now = new Date();

    const activeDiscounts = await Discount.find({
        admin: user._id,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
    }).populate('applicableMedicines', 'Med_Name Med_Price');

    res.status(200).json({
        success: true,
        data: activeDiscounts,
        count: activeDiscounts.length
    });
});

// Get single discount
const getDiscount = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    const discount = await Discount.findOne({ _id: id, admin: user?._id })
        .populate('applicableMedicines', 'Med_Name Med_Price Med_Category');

    if (!discount) {
        return res.status(404).json({
            success: false,
            message: 'Discount not found'
        });
    }

    res.status(200).json({
        success: true,
        data: discount
    });
})


// Create new discount
const createDiscount = asyncWrapper(async (req, res) => {
    const { user } = req;

    try {
        // Validate dates
        const { validFrom, validUntil } = req.body;
        if (new Date(validFrom) >= new Date(validUntil)) {
            return res.status(400).json({
                success: false,
                message: 'Valid from date must be before valid until date'
            });
        }

        // Validate applicable medicines if provided
        if (req.body.applicableMedicines && req.body.applicableMedicines.length > 0) {
            const medicines = await Medicine.find({
                _id: { $in: req.body.applicableMedicines },
                admin: user._id
            });




            if (medicines.length !== req.body.applicableMedicines.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some selected medicines are not found or do not belong to your pharmacy'
                });
            }
        

        const alreadyDiscounted = medicines.filter(med => med.currentDiscount);

        if (alreadyDiscounted.length > 0) {
            const names = alreadyDiscounted.map(m => m.Med_Name).join(', ');
            return res.status(400).json({
                success: false,
                message: `The following medicines already have a discount applied: ${names}`
            });
        }
        

        const discount = await Discount.create({
            ...req.body,
            admin: user._id
        });


               await Medicine.updateMany(
                { _id: { $in: req.body.applicableMedicines } },
                { $set: { currentDiscount: discount._id } }
            );

        await discount.populate('applicableMedicines', 'Med_Name Med_Price');

        await discount.save()

        res.status(201).json({
            success: true,
            data: discount,
            message: 'Discount created successfully'
        });
    }
    } catch (err) {
        console.error("Error creating discount:", err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update discount
const updateDiscount = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    // Validate dates if they are being updated
    if (req.body.validFrom || req.body.validUntil) {
        const discount = await Discount.findOne({ _id: id, admin: user?._id });
        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount not found'
            });
        }

        const validFrom = req.body.validFrom || discount.validFrom;
        const validUntil = req.body.validUntil || discount.validUntil;

        if (new Date(validFrom) >= new Date(validUntil)) {
            return res.status(400).json({
                success: false,
                message: 'Valid from date must be before valid until date'
            });
        }
    }

    // Validate applicable medicines if provided
    if (req.body.applicableMedicines && req.body.applicableMedicines.length > 0) {
        const medicines = await Medicine.find({
            _id: { $in: req.body.applicableMedicines },
            admin: user._id
        });

        if (medicines.length !== req.body.applicableMedicines.length) {
            return res.status(400).json({
                success: false,
                message: 'Some selected medicines are not found or do not belong to your pharmacy'
            });
        }
    }

    const discount = await Discount.findOneAndUpdate(
        { _id: id, admin: user?._id },
        req.body,
        { new: true, runValidators: true }
    ).populate('applicableMedicines', 'Med_Name Med_Price');

    if (!discount) {
        return res.status(404).json({
            success: false,
            message: 'Discount not found'
        });
    }

    res.status(200).json({
        success: true,
        data: discount,
        message: 'Discount updated successfully'
    });
});

// Delete discount
const deleteDiscount = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    console.log('hello')

    try {
        const discount = await Discount.findOneAndDelete({ _id: id, admin: user?._id });

        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Discount deleted successfully'
        });
    } catch (err) {
        console.log('errrr', err)
        return res.status(500).json({ message: err?.message })
    }

});

// Apply discount to medicine (for sales)
const applyDiscountToMedicine = asyncWrapper(async (req, res) => {
    const { medicineId, quantity = 1 } = req.body;
    const { user } = req;

    if(user.role === "employee") {
       user._id = user.admin;
    }

    // Get medicine
    const medicine = await Medicine.findOne({ _id: medicineId, admin: user?._id });
    if (!medicine) {
        return res.status(404).json({
            success: false,
            message: 'Medicine not found'
        });
    }

    const originalAmount = medicine.Med_Price * quantity;

    // Find applicable discounts
    const now = new Date();
    const applicableDiscounts = await Discount.find({
        admin: user?._id,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ],
        $or: [
            { applicableMedicines: { $in: [medicineId] } },
            { applicableCategories: { $in: [medicine.Med_Category] } },
            { $and: [{ applicableMedicines: { $size: 0 } }, { applicableCategories: { $size: 0 } }] }
        ]
    });

    let bestDiscount = null;
    let maxDiscountAmount = 0;

    // Find the best discount
    for (const discount of applicableDiscounts) {
        const discountAmount = discount.calculateDiscount(originalAmount);
        if (discountAmount > maxDiscountAmount) {
            maxDiscountAmount = discountAmount;
            bestDiscount = discount;
        }
    }

    const finalAmount = originalAmount - maxDiscountAmount;

    res.status(200).json({
        success: true,
        data: {
            medicine: {
                id: medicine._id,
                name: medicine.Med_Name,
                price: medicine.Med_Price,
                category: medicine.Med_Category
            },
            quantity,
            originalAmount,
            discountApplied: bestDiscount ? {
                id: bestDiscount._id,
                name: bestDiscount.discountName,
                type: bestDiscount.discountType,
                value: bestDiscount.discountValue,
                discountAmount: maxDiscountAmount
            } : null,
            finalAmount,
            savings: maxDiscountAmount
        }
    });
});

// Calculate discount for multiple items (for cart)
const calculateCartDiscount = asyncWrapper(async (req, res) => {
    const { items } = req.body; 
    const { user } = req;

    if(user.role === "employee") {
       user._id = user.admin; 
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Items array is required'
        });
    }

    const medicineIds = items.map(item => item.medicineId);
    const medicines = await Medicine.find({
        _id: { $in: medicineIds },
        admin: user?._id
    });

    if (medicines.length !== medicineIds.length) {
        return res.status(400).json({
            success: false,
            message: 'Some medicines not found'
        });
    }

    const now = new Date();
    const activeDiscounts = await Discount.find({
        admin: user?._id,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
    });

    console.log('applicable discounts:', activeDiscounts);

    let totalOriginalAmount = 0;
    let totalDiscountAmount = 0;
    const itemsWithDiscount = [];

    for (const item of items) {
        const medicine = medicines.find(m => m._id.toString() === item.medicineId);
        const originalAmount = medicine.Med_Price * item.quantity;
        totalOriginalAmount += originalAmount;

        // Find applicable discounts for this item
        const applicableDiscounts = activeDiscounts.filter(discount => {
            return discount.applicableMedicines.includes(item.medicineId) ||
                discount.applicableCategories.includes(medicine.Med_Category) ||
                (discount.applicableMedicines.length === 0 && discount.applicableCategories.length === 0);
        });

        let bestDiscount = null;
        let maxDiscountAmount = 0;

        for (const discount of applicableDiscounts) {
            const discountAmount = discount.calculateDiscount(originalAmount);
            if (discountAmount > maxDiscountAmount) {
                maxDiscountAmount = discountAmount;
                bestDiscount = discount;
            }
        }

        totalDiscountAmount += maxDiscountAmount;

        itemsWithDiscount.push({
            medicine: {
                id: medicine._id,
                name: medicine.Med_Name,
                price: medicine.Med_Price,
                category: medicine.Med_Category
            },
            quantity: item.quantity,
            originalAmount,
            discountApplied: bestDiscount ? {
                id: bestDiscount._id,
                name: bestDiscount.discountName,
                discountAmount: maxDiscountAmount
            } : null,
            finalAmount: originalAmount - maxDiscountAmount
        });
    }

    res.status(200).json({
        success: true,
        data: {
            items: itemsWithDiscount,
            summary: {
                totalOriginalAmount,
                totalDiscountAmount,
                totalFinalAmount: totalOriginalAmount - totalDiscountAmount,
                totalSavings: totalDiscountAmount
            }
        }
    });
});

// Toggle discount status
const toggleDiscountStatus = asyncWrapper(async (req, res) => {

    const { id } = req.params;
    const { user } = req;

    try{
 const discount = await Discount.findOne({ _id: id,admin:user?._id });

    if (!discount) {
        return res.status(404).json({
            success: false,
            message: 'Discount not found'
        });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.status(200).json({
        success: true,
        data: discount,
        message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`
    });
    }catch(err) {
     return res.status(500).json({message:err.message})
    }
   
});

module.exports = {
    getAllDiscounts,
    getActiveDiscounts,
    getDiscount,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    applyDiscountToMedicine,
    calculateCartDiscount,
    toggleDiscountStatus
};
