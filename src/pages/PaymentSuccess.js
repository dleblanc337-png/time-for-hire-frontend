import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const amount = location.state?.amount;

  // ✅ On success, remember this booking as "Paid" in localStorage
  useEffect(() => {
    if (!bookingId) return;

    try {
      const stored = JSON.parse(
        localStorage.getItem("paidBookings") || "[]"
      );

      if (!stored.includes(bookingId)) {
        stored.push(bookingId);
        localStorage.setItem(
          "paidBookings",
          JSON.stringify(stored)
        );
      }
    } catch (e) {
      console.error("Error saving paid booking to localStorage", e);
    }
  }, [bookingId]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>
        {amount ? (
          <>
            Your payment of <strong>${amount}</strong> has been
            processed and the booking is now marked as{" "}
            <strong>Paid</strong>.
          </>
        ) : (
          <>
            Your booking has now been marked as{" "}
            <strong>Paid</strong>.
          </>
        )}
      </p>

      <button
        onClick={() => navigate("/customer-dashboard")}
        style={{
          marginTop: "24px",
          padding: "10px 20px",
          background: "#0056d6",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Go to My Dashboard
      </button>
    </div>
  );
}

export default PaymentSuccess;
