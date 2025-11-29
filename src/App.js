// ================================================
// APP.JS — CLEAN ROUTING + SINGLE HEADER
// ================================================
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import HelperLogin from "./pages/HelperLogin";
import CustomerLogin from "./pages/CustomerLogin";
import BookingPage from "./pages/BookingPage";
import HelperDashboard from "./pages/HelperDashboard";
import ContactPage from "./pages/ContactPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/helper/login" element={<HelperLogin />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/helper/dashboard" element={<HelperDashboard />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
};

export default App;
