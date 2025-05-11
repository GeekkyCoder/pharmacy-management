import axios from "../../api/axios";

const getEmployeeById = async (employeeId) => {
  try {
    const response = await axios.get(`/employee/getEmployee/${employeeId}`);

    if (response.status !== 200) {
      throw new Error(request.statusText);
    }

    const { data } = response?.data;

    if (data) return data;
  } catch (err) {
    return false;
  }
};

const updateEmployee = async (employeeId, body, onFailure) => {
  try {
    const response = await axios.put(
      `employee/updateEmployee/${employeeId}`,
      body
    );

    if (response.status !== 201) {
      throw new Error(response.statusText);
    }

    const { data } = response?.data;

    if (data) return true;
    console.log("response", response);
  } catch (err) {
    onFailure(err?.message);
    return false;
  }
};

export { getEmployeeById, updateEmployee };
