import axios from "../../api/axios";

const getAllEmployees = async (adminId, onSuccess, onFailure) => {
  try {
    const response = await axios.get(`employee/getEmployees/${adminId}`);
    const {
      data: { data },
      request,
    } = response;

    if (request.status !== 200) {
      throw new Error(request.statusText);
    }

    if (data && Array.isArray(data)) {
      onSuccess(data);
    }

    return true;
  } catch (err) {
    console.log(`err`, err);
    onFailure(err?.message);
    return false;
  }
};

const deleteEmployee = async (employeeId,onSuccess,onFailure) => {
  try {
    const response = await axios.delete(
      `employee/deleteEmployee/${employeeId}`
    );

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    const { message } = response?.data;

    onSuccess(message);
    return true
  } catch (err) {
    onFailure(err?.message);
    return false
  }
};

export { getAllEmployees,deleteEmployee };
