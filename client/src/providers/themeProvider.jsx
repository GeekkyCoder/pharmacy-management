import React from 'react';
import { ConfigProvider } from 'antd';
import {useSelector } from 'react-redux';
import themes from "./themeDefinations"

const ThemeProvider = ({ children }) => {
  const {currentTheme} = useSelector((state) => state.theme);
  const theme = themes[currentTheme] || themes.clinicalClean;

  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
