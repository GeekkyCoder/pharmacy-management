import axios from "../../api/axios";

const getAllEmployees = async (onSuccess, onFailure) => {
  try {
    const response = await axios.get(`employee/getEmployees`);

    // Check if response is successful
    if (response.status === 200) {
      const employees = response.data?.data;
      
      if (employees && Array.isArray(employees)) {
        onSuccess(employees);
        return {
          success: true,
          data: employees,
          message: "Employees fetched successfully"
        };
      } else {
        const errorMsg = "No employees data received";
        onFailure(errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
    } else {
      const errorMsg = response.data?.message || "Failed to fetch employees";
      onFailure(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  } catch (err) {
    let errorMessage = err?.response?.data?.message || err.message
    onFailure(errorMessage);
    return {
      success: false,
      message: errorMessage
    };
  }
};

const deleteEmployee = async (employeeId, onSuccess, onFailure) => {
  try {
    // Validate input
    if (!employeeId) {
      const errorMsg = "Employee ID is required";
      onFailure(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }

    const response = await axios.delete(`employee/deleteEmployee/${employeeId}`);

    // Check if response is successful
    if (response.status === 200) {
      const message = response.data?.message || "Employee deleted successfully";
      onSuccess(message);
      return {
        success: true,
        message: message
      };
    } else {
      const errorMsg = response.data?.message || "Failed to delete employee";
      onFailure(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  } catch (err) {    
    let errorMessage = err?.response?.data?.message || err.message;
    
    onFailure(errorMessage);
    return {
      success: false,
      message: errorMessage
    };
  }
};

export { getAllEmployees, deleteEmployee };
