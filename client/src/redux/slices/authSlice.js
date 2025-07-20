import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { loginUserAPI } from "./authAPI";
import axios from "../../api/axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token:null,
  loading: false,
  error: null,
};

export const loginUserAPI = async (credentials) => {
  let res
  if (credentials?.role?.toLowerCase() === "employee") {
    res = await axios.post("/employee/loginEmployee", credentials);
  } else {
    res = await axios.post("/user/login", credentials);
  }
  return res.data;
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const data = await loginUserAPI(credentials);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // saving token to localStorage
        localStorage.setItem("user" , JSON.stringify(action.payload.user))
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
