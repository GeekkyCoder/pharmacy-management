const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');

const asyncWrapper = require("../../middlewares/async-wrapper");
const User = require("../../models/user");
const { generateVerificationToken, createVerificationLink } = require("../../utils");
const { sendVerificationEmail } = require("../../services/emailService");


const signUpUser = asyncWrapper(async (req, res, next) => {

  const payload = req.body;

  if (!payload?.userName || !payload?.password || !payload?.email) {
    return res.status(400).json({ message: "User information needed" });
  }
  const userDup = await User.findOne({ email: payload?.email });

  if (userDup) {
    return res.status(409).json({ message: "Duplicate Information" });
  }

  const { userName, password, email } = payload;


  const role = "admin";

  const verificationToken = generateVerificationToken();
  
  const hashedPassword = await bycrypt.hash(password, 10);

  const newUser = new User({
    userName,
    password: hashedPassword,
    email,
    role,
    verificationToken,
    active: false
  });

  await newUser.save();

 
  const verificationLink = createVerificationLink(verificationToken, 'user');


  try {
    const emailResult = await sendVerificationEmail(
      email,
      userName,
      email,
      password,
      verificationLink
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }


    return res
      .status(201)
      .json({
        user: {
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          role: newUser.role,
          active: newUser.active
        },
      message: "Admin Created Successfully. Verification email sent.",
        emailSent: emailResult.success
      });
  } catch (error) {
    console.error('Error in signup process:', error);
    return res.status(500).json({ 
      message: "User created but failed to send verification email",
      error: error.message 
    });
  }
});

const updatePassword = asyncWrapper(async (req, res, next) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Token, new password, and confirm password are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update user: set new password, activate account, remove verification token
    user.password = hashedPassword;
    user.active = true;
    user.verificationToken = null;
    
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully. Account activated.",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

const changePassword = asyncWrapper(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id; 

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Old password, new password, and confirm password are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({ message: "New password must be different from the current password" });
  }

  try {
    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isOldPasswordCorrect = await bycrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
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

    if (!userFound.active) {
      return res.status(401).json({ message: "Account not activated. Please check your email for verification instructions." })
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

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
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

module.exports = {
  signUpUser,
  userLogin,
  updatePassword,
  changePassword,
};
