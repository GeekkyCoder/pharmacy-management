const User = require("../models/user");
const Employee = require("../models/employee");
const { isTokenValid } = require("../utils");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        console.log("User token from cookies:", req.cookies.token);
        if (!token) {
            return res.status(401).json({ message: "Not authorized - Please login..." });
        }
        
        const {user:tokenUser} = await isTokenValid(token);

        let user
        if (tokenUser.role === "admin") {
            user = await User.findById(tokenUser._id);
        } else if (tokenUser.role === "employee") {
            user = await Employee.findById(tokenUser?._id)
        }

        if (!user) {
            return res.status(401).json({ message: "Not authorized - Please login.." });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("User auth error:", err);
        res.status(401).json({ message: "Not authorized - Please login.." });
    }
};

module.exports = {
    userAuth,
};