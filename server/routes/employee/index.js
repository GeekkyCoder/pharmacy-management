const EmployeeRouter= require("express").Router() 
const { signupEmployee, employeeLogin,getAllEmployees,getEmployeeById,deleteEmployee,updateEmployee } = require("../../controllers/employee");
const { userAuth } = require("../../middlewares/auth");
const {isAdmin} = require("../../middlewares/admin");

EmployeeRouter.post("/signupEmployee", [userAuth,isAdmin], signupEmployee)
EmployeeRouter.post("/loginEmployee", employeeLogin)
EmployeeRouter.get("/getEmployees", [userAuth,isAdmin], getAllEmployees)
EmployeeRouter.get("/getEmployee/:employeeId", [userAuth,isAdmin], getEmployeeById)
EmployeeRouter.put("/updateEmployee/:employeeId", [userAuth,isAdmin], updateEmployee)
EmployeeRouter.delete("/deleteEmployee/:employeeId", [userAuth,isAdmin], deleteEmployee)

module.exports = EmployeeRouter
