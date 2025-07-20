import axios from "../../api/axios";

const createEmployee = async (body) => {
  try {
    const response = await axios.post(`/employee/signupEmployee`, body);
    
    // Check if response is successful
    if (response.status === 201 || response.status === 200) {
      return { 
        success: true,
        data: response.data?.data, 
        message: response.data?.message || "Employee created successfully",
        responseCode: "00" 
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to create employee",
        responseCode: response.status.toString()
      };
    }
  } catch (err) {
    console.error("Error creating employee:", err);
    
    // Handle different types of errors
    if (err.response) {
      // Server responded with error status
      const status = err.response.status;
      const errorMessage = err.response.data?.message || err.response.data?.error;
      
      switch (status) {
        case 400:
          return {
            success: false,
            message: errorMessage || "Invalid employee data provided",
            responseCode: "400"
          };
        case 401:
          return {
            success: false,
            message: "Unauthorized. Please login again",
            responseCode: "401"
          };
        case 403:
          return {
            success: false,
            message: "You don't have permission to create employees",
            responseCode: "403"
          };
        case 409:
          return {
            success: false,
            message: errorMessage || "Employee with this email already exists",
            responseCode: "409"
          };
        case 422:
          return {
            success: false,
            message: errorMessage || "Validation failed. Please check your input",
            responseCode: "422"
          };
        case 500:
          return {
            success: false,
            message: "Server error. Please try again later",
            responseCode: "500"
          };
        default:
          return {
            success: false,
            message: errorMessage || `Server error (${status}). Please try again`,
            responseCode: status.toString()
          };
      }
    } else if (err.request) {
      // Network error - no response received
      return {
        success: false,
        message: "Network error. Please check your internet connection",
        responseCode: "NETWORK_ERROR"
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: "An unexpected error occurred. Please try again",
        responseCode: "UNKNOWN_ERROR"
      };
    }
  }
};

export { createEmployee };
