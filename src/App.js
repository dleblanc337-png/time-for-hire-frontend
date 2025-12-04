import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HelperDashboard from "./pages/HelperDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  return (
    <Router>
      {/* Header no longer expects props */}
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/helper-dashboard" element={<HelperDashboard />} />
<Route path="/customer-dashboard" element={<CustomerDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
