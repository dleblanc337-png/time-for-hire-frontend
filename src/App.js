import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";   // ⬅️ Make sure this path is correct

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerHome from "./pages/CustomerHome";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerBookings from "./pages/CustomerBookings";
import CustomerMessages from "./pages/CustomerMessages";

function App() {
  return (
    <Router>
      {/* ⭐ GLOBAL HEADER — now always visible */}
      <Header />

      {/* ⭐ MAIN CONTENT WRAPPER (avoid overlapping header) */}
      <div style={{ marginTop: "80px" }}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Dashboard */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/customer-bookings" element={<CustomerBookings />} />
          <Route path="/customer-messages" element={<CustomerMessages />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
