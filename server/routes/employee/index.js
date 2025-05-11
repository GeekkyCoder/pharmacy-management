const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  EmployeeLogin,
} = require("../../controllers/employee");

const Router = require("express").Router();

Router.post("/login", EmployeeLogin);
Router.get("/getEmployees/:adminId", getAllEmployees);
Router.get("/getEmployee/:employeeId", getEmployeeById);
Router.post("/createEmployee", createEmployee);
Router.put("/updateEmployee/:employeeId", updateEmployee);
Router.delete("/deleteEmployee/:employeeId", deleteEmployee);

module.exports = Router;
