import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function CustomerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([
    {
      id: 1,
      service: "House Cleaning",
      date: "2025-12-10",
      helper: "Sarah M.",
      status: "Pending",
      amount: 120,
    },
    {
      id: 2,
      service: "Yard Work",
      date: "2025-12-08",
      helper: "Mike R.",
      status: "Completed",
      amount: 85,
    },
  ]);

  function openMessage(helperName) {
    navigate("/customer-messages", {
      state: { selectedHelper: helperName },
    });
  }

  function handlePayment(booking) {
    navigate("/payment", {
      state: {
        bookingId: booking.id,
        amount: booking.amount,
        service: booking.service,
      },
    });
  }

  function statusColor(status) {
    if (status === "Paid") return "green";
    if (status === "Completed") return "blue";
    return "orange";
  }

  return (
    <DashboardLayout>
      <h1>My Bookings</h1>
      <p>Here is a list of your current and past bookings.</p>

      {bookings.map((booking) => (
        <div
          key={booking.id}
          style={{
            background: "#fff",
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            maxWidth: "700px",
          }}
        >
          <h3>{booking.service}</h3>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Helper:</strong> {booking.helper}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: statusColor(booking.status) }}>
              {booking.status}
            </span>
          </p>

          <p><strong>Amount:</strong> ${booking.amount}</p>

          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => openMessage(booking.helper)}
              style={{
                padding: "8px 14px",
                background: "#003f63",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Message Helper
            </button>

            {booking.status !== "Paid" && (
              <button
                onClick={() => handlePayment(booking)}
                style={{
                  padding: "8px 14px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
}

export default CustomerBookings;
