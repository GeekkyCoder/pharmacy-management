const { createSaleAndInvoice, getAllSales } = require("../../controllers/sale")

const SaleRouter = require("express").Router()

SaleRouter.post("/newSale", createSaleAndInvoice)
SaleRouter.get("/getAllSales", getAllSales)


module.exports = SaleRouter