import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/CustomerDashboard";
import HelperDashboard from "./pages/HelperDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;

    try {
      const user = JSON.parse(raw);
      setIsLoggedIn(true);
      setRole(user.role);
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        {/* CUSTOMER dashboard */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowed={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* HELPER dashboard */}
        <Route
          path="/helper/dashboard"
          element={
            <ProtectedRoute allowed={["helper"]}>
              <HelperDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
