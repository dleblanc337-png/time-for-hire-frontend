import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerBookings() {
  const [bookings, setBookings] = React.useState([
    {
      id: 1,
      service: "House Cleaning",
      date: "2025-12-10",
      helper: "Sarah M.",
      status: "Pending",
    },
    {
      id: 2,
      service: "Yard Work",
      date: "2025-12-08",
      helper: "Mike R.",
      status: "Completed",
    },
  ]);

  const cancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "Cancelled" } : b
      )
    );
  };

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
            <strong>Status: </strong>
            <span
              style={{
                color:
                  booking.status === "Pending"
                    ? "orange"
                    : booking.status === "Completed"
                    ? "green"
                    : "red",
              }}
            >
              {booking.status}
            </span>
          </p>

          {booking.status === "Pending" && (
            <button
              style={{
                padding: "6px 14px",
                background: "#b30000",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => cancelBooking(booking.id)}
            >
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </DashboardLayout>
  );
}

export default CustomerBookings;
