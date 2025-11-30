// frontend/src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import HelperDashboard from "./pages/HelperDashboard";

function App() {
  return (
    <Router>
      {/* 🔵 BLUE HEADER ALWAYS VISIBLE */}
      <Header />

      {/* 🔽 PAGE CONTENT BELOW HEADER */}
      <div style={{ marginTop: "100px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/helper-dashboard" element={<HelperDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
