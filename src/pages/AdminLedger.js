import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger } from "../utils/ledger";

function AdminLedger() {
  const ledger = getLedger();

  return (
    <DashboardLayout>
      <h1>Platform Ledger</h1>
      <p>This is a test dashboard showing escrow logic (no real payouts).</p>

      {ledger.length === 0 && <p>No entries yet.</p>}

      {ledger.map((e) => (
        <div
          key={e.bookingId}
          style={{
            marginTop: "20px",
            background: "#fff",
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            maxWidth: "600px"
          }}
        >
          <h3>Booking #{e.bookingId}</h3>
          <p><strong>Base Amount:</strong> ${e.baseAmount}</p>
          <p><strong>Customer Paid:</strong> ${e.totalCustomerCharge}</p>
          <p><strong>Helper Will Receive:</strong> ${e.helperReceives}</p>

          <p><strong>Stripe Fee:</strong> ${e.stripeFee}</p>
          <p><strong>TFH Revenue:</strong> ${e.platformFee}</p>
          <p><strong>Charity:</strong> ${e.charityAmount}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: e.status === "Completed" ? "green" : "orange" }}>
              {e.status}
            </span>
          </p>
        </div>
      ))}
    </DashboardLayout>
  );
}

export default AdminLedger;
