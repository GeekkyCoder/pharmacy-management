import axios from "../../api/axios";

const getAllMedicines = async (onSuccess, onFailure) => {
  try {
    const response = await axios.get(`/medicine/getMedicines`);
    const {
      data: { data },
      request,
    } = response;

    if (request.status !== 200) {
      throw new Error(request.statusText);
    }

    if (data) {
      onSuccess(data);
    }

    return true;
  } catch (err) {
    onFailure(err?.response?.data?.message || err?.message);
    return false;
  }
};

// Calculate discount for sale items
const calculateSaleDiscount = async (items, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/discount/calculate-cart", { items });
    const { data } = response.data;

    if (data) onSuccess(data);
    return true;
  } catch (err) {
    onFailure(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to calculate discount"
    );
    return false;
  }
};

// Apply discount to individual medicine
const applySingleDiscount = async (medicineId, quantity, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/discount/apply-to-medicine", {
      medicineId,
      quantity,
    });
    const { data } = response.data;

    if (data) onSuccess(data);
    return true;
  } catch (err) {
    onFailure(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to apply discount"
    );
    return false;
  }
};

const createNewSale = async (body, onSuccess, onFailure) => {
  try {
    const response = await axios.post("/sale/newSale", body);

    if (response.status !== 201) {
      throw new Error(response.statusText);
    }

    const { data } = response;

    const options = {
      success: true,
      message: "Sale, Invoice Created and Stock Updated!",
      sale: data?.newSale,
      invoice: data?.newInvoice,
    };

    onSuccess(options);
    return true;
  } catch (err) {
    onFailure(err?.response?.data?.message || err?.message);
    return false;
  }
};

// Get pharmacy information for printing
const getPharmacyInfo = async (onSuccess, onFailure) => {
  try {
    const response = await axios.get('/pharmacy-info');
    const { data } = response.data;
    
    if (data) onSuccess(data);
    return true;
  } catch (err) {
    onFailure(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch pharmacy information"
    );
    return false;
  }
};

export {
  getAllMedicines,
  createNewSale,
  calculateSaleDiscount,
  applySingleDiscount,
  getPharmacyInfo,
};
