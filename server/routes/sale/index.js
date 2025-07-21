const { createSaleAndInvoice, getAllSales, getSalesReport } = require("../../controllers/sale")
const { userAuth } = require("../../middlewares/auth")

const SaleRouter = require("express").Router()

SaleRouter.post("/newSale", userAuth, createSaleAndInvoice)
SaleRouter.get("/getAllSales", userAuth, getAllSales)
SaleRouter.post("/getSaleReports", userAuth, getSalesReport)

module.exports = SaleRouter