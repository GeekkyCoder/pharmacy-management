// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   theme: 'light', 
// };

// const themeSlice = createSlice({
//   name: 'theme',
//   initialState,
//   reducers: {
//     setTheme: (state, action) => {
//       state.theme = action.payload;
//     },
//   },
// });

// export const { setTheme } = themeSlice.actions;

// export default themeSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
currentTheme: 'clinicalClean',
};

const themeSlice = createSlice({
name: 'theme',
initialState,
reducers: {
switchTheme: (state, action) => {
state.currentTheme = action.payload;
},
},
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;