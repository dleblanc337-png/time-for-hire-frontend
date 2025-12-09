import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";

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
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Dashboard Hub */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-home" element={<CustomerHome />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-bookings" element={<CustomerBookings />} />
        <Route path="/customer-messages" element={<CustomerMessages />} />
      </Routes>
    </Router>
  );
}

export default App;
