const UserRouter = require("express").Router() 
const {signUpUser,userLogin, updatePassword, changePassword} = require("../../controllers/user")
const { userAuth } = require("../../middlewares/auth")

UserRouter.post("/signup", signUpUser)
UserRouter.post("/login", userLogin)
UserRouter.post("/update-password", updatePassword)
UserRouter.post("/change-password", userAuth, changePassword)

module.exports = UserRouter