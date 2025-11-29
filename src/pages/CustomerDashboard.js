// src/pages/CustomerDashboard.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // CUSTOMER EMAIL
  const customerEmail = localStorage.getItem("customerEmail");

  // Redirect if not logged in
  useEffect(() => {
    if (!customerEmail) {
      navigate("/customer/login");
    }
  }, [customerEmail, navigate]);

  // FETCH CUSTOMER BOOKINGS
  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API}/bookings/by-customer/${customerEmail}`);
      const data = await res.json();
      setBookings(data || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // CANCEL BOOKING
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const res = await fetch(`${API}/bookings/cancel/${bookingId}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings(); // Refresh list
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // STATUS COLORS
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { background: "#d4ffd6", color: "#006600" };
      case "Cancelled":
        return { background: "#ffe0e0", color: "#990000" };
      default:
      case "Pending":
        return { background: "#fff8d1", color: "#8a6d00" };
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading dashboard...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Your Bookings</h2>

        {bookings.length === 0 && (
          <p style={{ marginTop: 20 }}>You have no bookings yet.</p>
        )}

        {bookings.map((b) => (
          <div key={b._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.helperName}>{b.helperName}</h3>
              <span style={{ ...styles.statusTag, ...getStatusColor(b.status) }}>
                {b.status}
              </span>
            </div>

            <p style={styles.field}>
              <strong>Service:</strong> {b.service}
            </p>

            <p style={styles.field}>
              <strong>Date:</strong> {b.date}
            </p>

            <p style={styles.field}>
              <strong>Time:</strong>{" "}
              {Array.isArray(b.timeSlots)
                ? b.timeSlots.join(", ")
                : "Not specified"}
            </p>

            <p style={styles.field}>
              <strong>Price:</strong> ${b.price}
            </p>

            <p style={styles.field}>
              <strong>Notes:</strong> {b.notes || "—"}
            </p>

            {b.status === "Pending" && (
              <button
                style={styles.cancelButton}
                onClick={() => handleCancel(b._id)}
              >
                Cancel Booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;

// =========================
//          STYLES
// =========================
const styles = {
  page: {
    background: "#f3f6fb",
    minHeight: "100vh",
    paddingTop: "30px",
  },
  container: {
    width: "90%",
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "20px",
    color: "#003366",
    fontSize: "26px",
    borderBottom: "2px solid #c7d4e6",
    paddingBottom: "6px",
  },
  card: {
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #d2dceb",
    marginBottom: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperName: {
    margin: 0,
    color: "#003366",
  },
  field: {
    marginTop: "6px",
    fontSize: "15px",
  },
  statusTag: {
    padding: "4px 10px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: "12px",
    padding: "10px 14px",
    background: "#cc0000",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
