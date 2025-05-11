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
    onFailure(err?.message);
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
    onFailure(err?.message);
    return false;
  }
};

export { getAllMedicines, createNewSale };
