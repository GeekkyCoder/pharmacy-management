import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { loginUserAPI } from "./authAPI";
import axios from "../../api/axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: null,
  loading: false,
  error: null,
};

export const loginUserAPI = async (credentials) => {
  const res = await axios.post("/admin/login", credentials);
  return res.data;
};

export const employeeUserAPI = async (credentials) => {
  const res = await axios.post("/employee/login", credentials);
  return res.data;
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const data = await loginUserAPI(credentials);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
export const Employeelogin = createAsyncThunk(
  "auth/employee/login",
  async (credentials, thunkAPI) => {
    try {
      const data = await employeeUserAPI(credentials);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
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
        console.log("payloaddd", action.payload);
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
      // Employee Login
      .addCase(Employeelogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(Employeelogin.fulfilled, (state, action) => {
        console.log("Employee Payload:", action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("user" , JSON.stringify(action.payload.user))
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(Employeelogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
