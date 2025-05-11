const { getDashboardSummary } = require("../../controllers/dashboard")

const dashboardRouter = require("express").Router()

dashboardRouter.get("/summary", getDashboardSummary)

module.exports = dashboardRouter

