import axios from "../../api/axios";

export const salesReport = async (body, onSuccess, onFailure) => {
    try {
      const response = await axios.post("/sale/getSaleReports", body);
  
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }

      const { message,success,data } = response.data;
  
      if (success) onSuccess({data, message });
      else onFailure(message);
    } catch (err) {
      onFailure(err?.response?.data?.message || err.message);
      return false;
    }
  };
  