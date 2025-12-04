import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HelperDashboard from "./pages/HelperDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerBookings from "./pages/CustomerBookings";
import CustomerMessages from "./pages/CustomerMessages";
import HelperJobs from "./pages/HelperJobs";
import HelperMessages from "./pages/HelperMessages";

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
/>{/* Customer pages */}
<Route
  path="/customer-bookings"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerBookings />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-messages"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerMessages />
    </ProtectedRoute>
  }
/>

{/* Helper pages */}
<Route
  path="/helper-jobs"
  element={
    <ProtectedRoute allowedRoles={["helper"]}>
      <HelperJobs />
    </ProtectedRoute>
  }
/>

<Route
  path="/helper-messages"
  element={
    <ProtectedRoute allowedRoles={["helper"]}>
      <HelperMessages />
    </ProtectedRoute>
  }
/>


      </Routes>
    </Router>
  );
}

export default App;
