import axios from "../../api/axios";

const createPurchase = async (body, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/purchase/newPurchase", body);

    const { data } = response.data;

    if (data) onSuccess({data,message:response?.data?.message});
    return true;
  } catch (err) {
    onFailure(err?.response?.data?.message || err?.message || "Failed to create purchase");
    return false;
  }
};

// Calculate discount for purchase items
const calculatePurchaseDiscount = async (items, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/discount/calculate-cart", { items });
    const { data } = response.data;
    
    if (data) onSuccess(data);
    return true;
  } catch (err) {
    onFailure(err?.response?.data?.message || err?.message || "Failed to calculate discount");
    return false;
  }
};

// Get all medicines for validation
const getAllMedicines = async (onSuccess, onFailure) => {
  try {
    const response = await axios.get("/medicine/getMedicines");
    const { data } = response.data;
    
    if (data) onSuccess(data);
    return true;
  } catch (err) {
    onFailure(err?.response?.data?.message || err?.message || "Failed to get medicines");
    return false;
  }
};

export { createPurchase, calculatePurchaseDiscount, getAllMedicines };
