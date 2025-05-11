const { createSupplierPurchase, getSuppliersAndPurchase, getSupplierInfoByMedId } = require("../../controllers/purchase");

const Router = require("express").Router();

Router.post("/newPurchase", createSupplierPurchase);
Router.get("/getSupplierAndPurchases", getSuppliersAndPurchase)
Router.get("/getSupplierInfoByMedId/:medName", getSupplierInfoByMedId)

module.exports = Router