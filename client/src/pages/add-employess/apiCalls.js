import axios from "../../api/axios";

const createEmployee = async (body, onSuccess, onFailure) => {
  try {
    const response = await axios.post(`/employee/createEmployee`, body);
    const {
      data: { data },
      request,
    } = response;
    if (request.status !== 201) {
      return false;
    }
    if (data)
      return { data, message: response?.data?.message, responseCode: "00" };
    else return false;
  } catch (err) {
    console.log("internal server error");
    return false;
  }
};

export { createEmployee };
