import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layout';
import Home from './pages/home'; 
import Reports from './pages/recports'; 
import AddMedicine from "./pages/add-medicine"

import "./App.css"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="reports" element={<Reports />} />
          <Route path="add-medicine" element={<AddMedicine />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
