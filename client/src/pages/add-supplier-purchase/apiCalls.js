import axios from "../../api/axios";

const createPurchase = async (body, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/purchase/newPurchase", body);

    if (response.status !== 201) {
      throw new Error(response.statusText);
    }

    const { data } = response.data;

    if (data) onSuccess({data,message:response?.data?.message});
    return true;
  } catch (err) {
    onFailure(err?.message);
    return false;
  }
};

export { createPurchase };
