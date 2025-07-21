import axiosInstance from "../../api/axios";

export const updatePassword = async (payload) => {
  try {
    const { userType, ...data } = payload;
    
    const endpoint = userType === 'employee' 
      ? '/employee/update-password' 
      : '/user/update-password';
        
    const response = await axiosInstance.post(endpoint, data);
    return response;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

export const updatePasswordWithOld = async (payload) => {
  try {
    const { userType, ...data } = payload;
    
    const endpoint = userType === 'employee' 
      ? '/employee/change-password' 
      : '/user/change-password';
    
    const response = await axiosInstance.post(endpoint, data);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};
