const { createSupplierPurchase, getSuppliersAndPurchase, getSupplierInfoByMedId } = require("../../controllers/purchase");
const { isAdmin } = require("../../middlewares/admin");
const { userAuth } = require("../../middlewares/auth");

const Router = require("express").Router();

Router.post("/newPurchase", userAuth, createSupplierPurchase);
Router.get("/getSupplierAndPurchases", userAuth, getSuppliersAndPurchase);
Router.get("/getSupplierInfoByMedId/:medName", userAuth, getSupplierInfoByMedId);

module.exports = Router