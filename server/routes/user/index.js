const UserRouter = require("express").Router() 
const {signUpUser,userLogin} = require("../../controllers/user")
const { userAuth } = require("../../middlewares/auth")

UserRouter.post("/signup", signUpUser)
UserRouter.post("/login", userLogin)

module.exports = UserRouter