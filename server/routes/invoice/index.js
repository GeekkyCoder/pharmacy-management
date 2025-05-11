const { getAllInvoices } = require("../../controllers/invoices")

const InvoiceRouter = require("express").Router()

InvoiceRouter.get("/getAllInvoices", getAllInvoices)

module.exports = InvoiceRouter