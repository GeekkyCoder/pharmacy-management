import axios from "../../api/axios";


export const restockMedicine = async (body, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/medicine/restock", body);

    if (response.status !== 201) {
      throw new Error(response.statusText);
    }

    const { message,success } = response.data;

    if (success) onSuccess({ message });
    return true;
  } catch (err) {
    onFailure(err?.message);
    return false;
  }
};
