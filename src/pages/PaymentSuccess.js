import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addLedgerEntry } from "../utils/ledger";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const amount = Number(location.state?.amount || 0);

  useEffect(() => {
    if (!bookingId) return;

    // Record this job in ledger (escrow simulation)
    addLedgerEntry({
      bookingId,
      baseAmount: amount,
    });

    // Also flag booking as "Paid" for UI purposes
    try {
      const stored = JSON.parse(
        localStorage.getItem("paidBookings") || "[]"
      );
      if (!stored.includes(bookingId)) {
        stored.push(bookingId);
        localStorage.setItem("paidBookings", JSON.stringify(stored));
      }
    } catch (e) {
      console.error("Error saving paid booking", e);
    }
  }, [bookingId, amount]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>
        Your booking <strong>#{bookingId}</strong> has been paid.
      </p>
      <p>
        $ {amount} recorded in your job escrow ledger.
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
