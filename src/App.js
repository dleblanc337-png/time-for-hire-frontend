import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";

/* Public */
import PublicHome from "./pages/PublicHome";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* Dashboards */
import CustomerDashboard from "./pages/CustomerDashboard";
import HelperDashboard from "./pages/HelperDashboard";

/* Customer */
import CustomerHome from "./pages/CustomerHome";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerBookings from "./pages/CustomerBookings";
import CustomerMessages from "./pages/CustomerMessages";

/* Helper */
import HelperAvailability from "./pages/HelperAvailability";
import HelperProfile from "./pages/HelperProfile";
import HelperMessages from "./pages/HelperMessages";
import HelperEarnings from "./pages/HelperEarnings";

/* Payments */
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

/* Admin */
import AdminLedger from "./pages/AdminLedger";

/* Smart dashboard redirect */
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "helper") return <Navigate to="/helper/dashboard" replace />;
  if (user.role === "customer") return <Navigate to="/customer/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/ledger" replace />;

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Legacy routes (old links) -> redirect to new clean routes */}
        <Route path="/customer-dashboard" element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="/customer-home" element={<Navigate to="/customer/home" replace />} />
        <Route path="/customer-profile" element={<Navigate to="/customer/profile" replace />} />
        <Route path="/customer-bookings" element={<Navigate to="/customer/bookings" replace />} />
        <Route path="/customer-messages" element={<Navigate to="/customer/messages" replace />} />

        <Route path="/helper-dashboard" element={<Navigate to="/helper/dashboard" replace />} />
        <Route path="/helper-profile" element={<Navigate to="/helper/profile" replace />} />
        <Route path="/helper-availability" element={<Navigate to="/helper/availability" replace />} />
        <Route path="/helper-messages" element={<Navigate to="/helper/messages" replace />} />
        <Route path="/helper-earnings" element={<Navigate to="/helper/earnings" replace />} />

        <Route path="/admin-ledger" element={<Navigate to="/admin/ledger" replace />} />
        {/* Catch-all: never show a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Smart Dashboard */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Customer */}
        <Route
          path="/customer/dashboard"
          element={
            <RequireAuth role="customer">
              <CustomerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/customer/home"
          element={
            <RequireAuth role="customer">
              <CustomerHome />
            </RequireAuth>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <RequireAuth role="customer">
              <CustomerProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <RequireAuth role="customer">
              <CustomerBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/customer/messages"
          element={
            <RequireAuth role="customer">
              <CustomerMessages />
            </RequireAuth>
          }
        />

        {/* Helper */}
        <Route
          path="/helper/dashboard"
          element={
            <RequireAuth role="helper">
              <HelperDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/helper/profile"
          element={
            <RequireAuth role="helper">
              <HelperProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/helper/availability"
          element={
            <RequireAuth role="helper">
              <HelperAvailability />
            </RequireAuth>
          }
        />
        <Route
          path="/helper/messages"
          element={
            <RequireAuth role="helper">
              <HelperMessages />
            </RequireAuth>
          }
        />
        <Route
          path="/helper/earnings"
          element={
            <RequireAuth role="helper">
              <HelperEarnings />
            </RequireAuth>
          }
        />

        {/* Payments */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* Admin */}
        <Route
          path="/admin/ledger"
          element={
            <RequireAuth role="admin">
              <AdminLedger />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
