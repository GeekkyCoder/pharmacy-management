const UserRouter = require("express").Router() 
const {signUpUser, userLogin, userLogout, testCookieAuth} = require("../../controllers/user")
const { userAuth } = require("../../middlewares/auth")

UserRouter.post("/signup", signUpUser)
UserRouter.post("/login", userLogin)
UserRouter.post("/logout", userLogout)
UserRouter.get("/test-auth", userAuth, testCookieAuth) // Test cookie auth

module.exports = UserRouter