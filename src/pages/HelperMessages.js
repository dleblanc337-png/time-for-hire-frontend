import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger } from "../utils/ledger";

function HelperMessages() {
  const [ledger, setLedger] = useState(getLedger());

  function markCompleted(bookingId) {
    // Update ledger status from Paid → Completed
    const updated = ledger.map((entry) =>
      entry.bookingId === bookingId
        ? { ...entry, status: "Completed", completedAt: new Date().toISOString() }
        : entry
    );

    setLedger(updated);
    localStorage.setItem("ledger", JSON.stringify(updated));
  }

  return (
    <DashboardLayout>
      <h1>Helper Job Panel</h1>

      <p>Jobs you have been hired for and can mark as completed:</p>

      {ledger.length === 0 && (
        <p>No paid jobs yet.</p>
      )}

      {ledger.map((entry) => (
        <div
          key={entry.bookingId}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "8px",
            maxWidth: "600px",
          }}
        >
          <h3>Booking #{entry.bookingId}</h3>
          <p><strong>Base Amount:</strong> ${entry.baseAmount}</p>
          <p><strong>Customer Paid:</strong> ${entry.totalCustomerCharge}</p>
          <p><strong>You Will Receive:</strong> ${entry.helperReceives}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: entry.status === "Completed" ? "green" : "orange" }}>
              {entry.status}
            </span>
          </p>

          {entry.status === "Paid" && (
            <button
              onClick={() => markCompleted(entry.bookingId)}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Mark as Completed
            </button>
          )}

          {entry.status === "Completed" && (
            <p style={{ marginTop: "10px", color: "green" }}>
              ✔ Job Completed — Awaiting payout (future feature)
            </p>
          )}
        </div>
      ))}
    </DashboardLayout>
  );
}

export default HelperMessages;
