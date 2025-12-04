import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HelperDashboard from "./pages/HelperDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      {/* Header no longer expects props */}
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/helper-dashboard"
  element={
    <ProtectedRoute allowedRoles={["helper"]}>
      <HelperDashboard />
    </ProtectedRoute>
  }
/>
        <Route  path="/customer-dashboard"element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerDashboard />
    </ProtectedRoute>
  }
/>

      </Routes>
    </Router>
  );
}

export default App;
