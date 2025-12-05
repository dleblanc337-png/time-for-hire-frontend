import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/CustomerDashboard";
import HelperDashboard from "./pages/HelperDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import CustomerHome from "./pages/CustomerHome";
import CustomerBookings from "./pages/CustomerBookings";
import CustomerMessages from "./pages/CustomerMessages";
import CustomerProfile from "./pages/CustomerProfile";

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
      {/* CUSTOMER subpages */}
<Route
  path="/customer-dashboard/home"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-dashboard/bookings"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerBookings />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-dashboard/messages"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerMessages />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-dashboard/profile"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/bookings"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerBookings />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/messages"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerMessages />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/profile"
  element={
    <ProtectedRoute allowed={["customer"]}>
      <CustomerProfile />
    </ProtectedRoute>
  }
/>
    </Router>
  );
}

export default App;
