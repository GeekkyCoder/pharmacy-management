const { createCustomError } = require("../../errors");
const asyncWrapper = require("../../middlewares/async-wrapper");
const Employee = require("../../models/employee");

const EmployeeLogin = asyncWrapper(async (req, res, next) => {
  const { E_Username, E_Password } = req.body;

  if (!E_Username || !E_Password) {
    return next(createCustomError("Invalid Credentials", 401));
  }

  const empFound = await Employee.findOne({ E_Username });

  if (!empFound) {
    return next(createCustomError("employee does not exist", 404));
  }

  if (E_Password !== empFound?.E_Password) {
    return next(createCustomError("Password does not match"));
  }

  const user = {
    _id:empFound?._id,
    userName: empFound?.E_Username,
    role: "employee",
  };

  return res.status(200).json({user:user,token: "1241421414",});
});

// Create a new employee
const createEmployee = asyncWrapper(async (req, res, next) => {
  const { E_Fname, E_Lname, E_Sex, E_Phno, E_date, Admin_ID } = req.body;

  if (!E_Fname || !E_Lname || !E_Sex || !E_Phno || !E_date || !Admin_ID) {
    return next(
      createCustomError("please provide necessary informations", 404)
    );
  }

  const newEmployee = new Employee(req.body);
  const savedEmployee = await newEmployee.save();
  return res
    .status(201)
    .json({ message: "Employee created successfully", data: savedEmployee });
});

// Get all employees
const getAllEmployees = asyncWrapper(async (req, res, next) => {
  const adminId = req.params?.adminId;
  console.log("adminId", adminId);
  const employees = await Employee.find({ Admin_ID: adminId }).populate(
    "Admin_ID"
  );
  res.status(200).json({ data: employees });
});

// Get a single employee by ID
const getEmployeeById = asyncWrapper(async (req, res, next) => {
  const employee = await Employee.findById(req.params?.employeeId).populate(
    "Admin_ID"
  );
  if (!employee) return res.status(404).json({ error: "Employee not found" });

  res.status(200).json({ data: employee });
});

// Update employee
const updateEmployee = asyncWrapper(async (req, res, next) => {
  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.employeeId,
    req.body,
    { new: true }
  );
  if (!updatedEmployee) {
    return next(createCustomError("employee not found", 404));
  }

  res.status(201).json({ message: "Employee updated", data: updatedEmployee });
});

// Delete employee
const deleteEmployee = asyncWrapper(async (req, res, next) => {
  const deleted = await Employee.findByIdAndDelete(req.params?.employeeId);
  if (!deleted) return next(createCustomError("employee notf found", 404));
  res.status(200).json({ message: "Employee deleted successfully" });
});

module.exports = {
  EmployeeLogin,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
