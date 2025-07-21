import axios from "../../api/axios";

const fetchPurchaseData = async (params, onSuccess, onFailure) => {
  try {
    const response = await axios.get(
      "/purchase/getSupplierAndPurchases",
      {
        params
      }
    );

    // if (response.status !== 200) {
    //   throw new Error(response.request?.message);
    // }

    const { data = [], limit = 5, totalRecords,currentPage } = response?.data;

    if (data.length) {
      const options = {
        currentPage,
        limit,
        data,
        totalRecords,
      };

      onSuccess(options);
    }
    return true
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err.message || "Failed to fetch purchase data";
    onFailure(errorMessage);
    return false
  }
};


export {fetchPurchaseData}