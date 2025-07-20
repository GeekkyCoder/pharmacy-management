const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');

const asyncWrapper = require("../../middlewares/async-wrapper");
const User = require("../../models/user");


const signUpUser = asyncWrapper(async (req, res, next) => {

  const payload = req.body;

  if (!payload?.userName || !payload?.password || !payload?.email) {
    return res.status(404).json({ message: "User information needed" });
  }
  const userDup = await User.findOne({ email: payload?.email });

  if (userDup) {
    return res.status(404).json({ message: "Duplicate Information" });
  }

  if (!payload?.userName || !payload?.password || !payload?.email) {
    return res.status(404).json({ message: "User information needed" });
  }

  const { userName, password, email } = payload;

  // For admin signup, always assign admin role
  const role = "admin";

  //hash password to store hashed password
  const hashedPassword = await bycrypt.hash(password, 10);

  const newUser = new User({
    userName,
    password: hashedPassword,
    email,
    role
  });

  await newUser.save();

  return res
    .status(200)
    .json({
      user: newUser,
      msg: "Admin Created Successfully",
    });
});

const userLogin = asyncWrapper(async (req, res, next) => {
  const payload = req.body;

  if (!payload?.userEmail && !payload?.userPassword) {
    return res.status(404).json({ message: "Provide email and password" });
  }

  try {
    const userFound = await User.findOne({ email: payload?.userEmail });

    if (!userFound) {
      return res.status(401).json({ message: "user is not a admin or does not exist" })
    }

    const isPasswordCorrect = await bycrypt.compare(payload?.userPassword, userFound.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "incorrect password" })
    }


    const userData = {
      _id: userFound?._id,
      userName: userFound.userName,
      email: userFound.email,
      role: userFound.role,
    }

    // Generate JWT token
    const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Cookie configuration for cross-domain production setup
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS attacks
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'None' : 'Lax', // 'None' required for cross-domain in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
      domain: isProduction ? undefined : undefined, // Let browser handle domain
      path: '/', // Available on all paths
    });

    const user = {
      _id: userFound?._id,
      userName: userFound.userName,
      userEmail: userFound.email,
      role: userFound.role,
    };

    return res.status(200).json({
      user,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }

});

const userLogout = asyncWrapper(async (req, res) => {
  // Clear the authentication cookie
  const isProduction = process.env.NODE_ENV === "production";
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

const testCookieAuth = asyncWrapper(async (req, res) => {
  // This endpoint tests if cookie authentication works
  return res.status(200).json({
    success: true,
    message: "Cookie authentication working!",
    user: {
      id: req.user._id,
      userName: req.user.userName,
      role: req.user.role
    },
    cookies: {
      tokenExists: !!req.cookies.token,
      cookieCount: Object.keys(req.cookies).length
    }
  });
});

module.exports = {
  signUpUser,
  userLogin,
  userLogout,
  testCookieAuth,
};
