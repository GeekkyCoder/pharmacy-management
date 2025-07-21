const asyncWrapper = require("../../middlewares/async-wrapper");
const Employee = require("../../models/employee");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateVerificationToken, createVerificationLink } = require("../../utils");
const { sendVerificationEmail } = require("../../services/emailService");



const signupEmployee = asyncWrapper(async (req, res) => {

  const user = req.user;

  const payload = req.body;

  if (!payload?.userName || !payload?.password || !payload?.email) {
    return res.status(400).json({ message: "Employee information needed" });
  }

  const employeeDup = await Employee.findOne({ email: payload?.email });

  if (employeeDup) {
    return res.status(409).json({ message: "Duplicate Information" });
  }

  const { userName, password, email } = payload;

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Hash password to store hashed password
  const hashedPassword = await bycrypt.hash(password, 10);

  const newEmployee = new Employee({
    userName,
    password: hashedPassword,
    email,
    admin: user._id,
    verificationToken,
    active: false
  });

  await newEmployee.save();


  const verificationLink = createVerificationLink(verificationToken, 'employee');

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
        employee: {
          _id: newEmployee._id,
          userName: newEmployee.userName,
          email: newEmployee.email,
          role: newEmployee.role,
          active: newEmployee.active
        },
        msg: "Employee Created Successfully. Verification email sent.",
        emailSent: emailResult.success
      });
  } catch (error) {
    console.error('Error in employee signup process:', error);
    return res.status(500).json({ 
      message: "Employee created but failed to send verification email",
      error: error.message 
    });
  }
});


const employeeLogin = asyncWrapper(async (req, res, next) => {
  const payload = req.body;

  if (!payload?.userEmail || !payload?.userPassword) {
    return res.status(404).json({ message: "Email and password are required" });
  }

  const employee = await Employee.findOne({ email: payload.userEmail });

  if (!employee) {
    return res.status(404).json({ message: "user is not a employee or does not exist" });
  }

  if (!employee.active) {
    return res.status(401).json({ message: "Account not activated. Please check your email for verification instructions." });
  }

  const isMatch = await bycrypt.compare(payload.userPassword, employee.password);

  if (!isMatch) {
    return res.status(404).json({ message: "Wrong Password" });
  }

  const user = {
    _id: employee?._id,
    userName: employee.userName,
    userEmail: employee.email,
    role: employee.role,
    admin: employee.admin
  };

  const token = await jwt.sign({ user: user }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  // Cookie configuration for cross-domain production setup
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true, // Prevents XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'None' : 'Lax', // 'None' required for cross-domain in production
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days (matches JWT expiry)
    domain: isProduction ? undefined : undefined, // Let browser handle domain
    path: '/', // Available on all paths
  });



  res.status(200).json({ user, token });
});

// Get all employees
const getAllEmployees = asyncWrapper(async (req, res) => {

  const user = req.user;

  const employees = await Employee.find({ admin: user._id?.toString() })

  res.status(200).json({ data: employees });
});

// Get a single employee by ID
const getEmployeeById = asyncWrapper(async (req, res) => {

  const user = req.user;

  const employee = await Employee.findOne({ _id: req.params?.employeeId, admin: user._id })

  if (!employee) return res.status(404).json({ error: "Employee not found" });

  res.status(200).json({ data: employee });
});

// Update employee
const updateEmployee = asyncWrapper(async (req, res) => {
  const user = req.user;

  const updatedEmployee = await Employee.findOneAndUpdate(
    { _id: req.params.employeeId, admin: user._id },
    req.body,
    { new: true }
  );
  if (!updatedEmployee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.status(201).json({ message: "Employee updated", data: updatedEmployee });
});

// Delete employee
const deleteEmployee = asyncWrapper(async (req, res) => {

  const user = req.user;

  const deleted = await Employee.findOneAndDelete({ _id: req.params?.employeeId, admin: user._id });
  if (!deleted) return res.status(404).json({ message: "Employee not found" });
  res.status(200).json({ message: "Employee deleted successfully" });
});

const updateEmployeePassword = asyncWrapper(async (req, res, next) => {
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
    // Find employee by verification token
    const employee = await Employee.findOne({ verificationToken: token });

    if (!employee) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update employee: set new password, activate account, remove verification token
    employee.password = hashedPassword;
    employee.active = true;
    employee.verificationToken = null;
    
    await employee.save();

    return res.status(200).json({
      message: "Password updated successfully. Account activated.",
      employee: {
        _id: employee._id,
        userName: employee.userName,
        email: employee.email,
        role: employee.role,
        active: employee.active
      }
    });

  } catch (error) {
    console.error('Error updating employee password:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

const changeEmployeePassword = asyncWrapper(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id; // From auth middleware

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
    // Find employee
    const employee = await Employee.findById(userId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify old password
    const isOldPasswordCorrect = await bycrypt.compare(oldPassword, employee.password);
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update employee password
    employee.password = hashedPassword;
    await employee.save();

    return res.status(200).json({
      message: "Password changed successfully",
      employee: {
        _id: employee._id,
        userName: employee.userName,
        email: employee.email,
        role: employee.role,
        active: employee.active
      }
    });

  } catch (error) {
    console.error('Error changing employee password:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

module.exports = {
  signupEmployee,
  employeeLogin,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeePassword,
  changeEmployeePassword,
};

