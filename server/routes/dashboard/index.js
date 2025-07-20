const { getDashboardSummary } = require("../../controllers/dashboard")
const { isAdmin } = require("../../middlewares/admin")
const { userAuth } = require("../../middlewares/auth")

const dashboardRouter = require("express").Router()

dashboardRouter.get("/summary",[userAuth, isAdmin], getDashboardSummary)

module.exports = dashboardRouter

