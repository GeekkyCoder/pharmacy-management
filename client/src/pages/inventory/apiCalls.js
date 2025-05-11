import axios from "../../api/axios";

const getAllMedicines = async (onSuccess, onFailure, searchText) => {
  try {
    const response = await axios.get(
      `/medicine/getMedicines?search=${searchText}`
    );
    const {
      data: { data },
      request,
    } = response;

    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    if (data) {
        const options = {
            tableData:data, 
            currentPage: response?.data?.page,
            totalPages:response?.data?.totalPages,
            limit: response?.data?.limit
        }
      onSuccess(options);
    }

    return true;
  } catch (err) {
    onFailure(err?.message);
    return false;
  }
};

export { getAllMedicines };
