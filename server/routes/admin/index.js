const AdminRouter = require("express").Router() 
const {createAdmin,adminLogin} = require("../../controllers/admin")

AdminRouter.post("/create", createAdmin)
AdminRouter.post("/login", adminLogin)

module.exports = AdminRouter