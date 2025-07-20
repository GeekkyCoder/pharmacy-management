const asyncWrapper = require("../../middlewares/async-wrapper");
const Employee = require("../../models/employee");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const signupEmployee = asyncWrapper(async (req, res) => {

  const user = req.user;

  const payload = req.body;

  if (!payload?.userName || !payload?.password || !payload?.email) {
    return res.status(404).json({ message: "Employee information needed" });
  }

  const employeeDup = await Employee.findOne({ email: payload?.email });

  if (employeeDup) {
    return res.status(404).json({ message: "Duplicate Information" });
  }

  const { userName, password, email } = payload;

  //hash password to store hashed password
  const hashedPassword = await bycrypt.hash(password, 10);

  const newEmployee = new Employee({
    userName,
    password: hashedPassword,
    email,
    admin: user._id
  });

  await newEmployee.save();

  return res
    .status(200)
    .json({
      employee: newEmployee,
      msg: "Employee Created Successfully",
    });
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

module.exports = {
  signupEmployee,
  employeeLogin,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
