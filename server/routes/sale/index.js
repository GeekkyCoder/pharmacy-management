const { createSaleAndInvoice, getAllSales, getSalesReport } = require("../../controllers/sale")

const SaleRouter = require("express").Router()

SaleRouter.post("/newSale", createSaleAndInvoice)
SaleRouter.get("/getAllSales", getAllSales)
SaleRouter.post("/getSaleReports", getSalesReport)

module.exports = SaleRouter