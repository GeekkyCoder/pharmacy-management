const { getAllInvoices } = require("../../controllers/invoices")
const { userAuth } = require("../../middlewares/auth")

const InvoiceRouter = require("express").Router()

InvoiceRouter.get("/getAllInvoices", userAuth, getAllInvoices)

module.exports = InvoiceRouter