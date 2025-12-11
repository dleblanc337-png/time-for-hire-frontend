import React, { useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger } from "../utils/ledger";

function HelperEarnings() {
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const ledger = getLedger();

  const currentYear = new Date().getFullYear();

  const {
    totalEarnedThisYear,
    totalPendingThisYear,
    totalCompletedThisYear,
    totalCharityThisYear,
    sortedEntries
  } = useMemo(() => {
    let earned = 0;
    let pending = 0;
    let completed = 0;
    let charity = 0;

    const entries = [...ledger].sort((a, b) => {
      const ta = new Date(a.timestamp || a.completedAt || 0).getTime();
      const tb = new Date(b.timestamp || b.completedAt || 0).getTime();
      return tb - ta;
    });

    entries.forEach((e) => {
      const year = new Date(e.timestamp || e.completedAt || 0).getFullYear();
      if (!year || year !== currentYear) return;

      const helper = Number(e.helperReceives || 0);
      const charityPart = Number(e.charityAmount || 0);

      if (e.status === "Completed") {
        earned += helper;
        completed += helper;
        charity += charityPart;
      } else if (e.status === "Paid") {
        pending += helper;
      }
    });

    return {
      totalEarnedThisYear: earned.toFixed(2),
      totalPendingThisYear: pending.toFixed(2),
      totalCompletedThisYear: completed.toFixed(2),
      totalCharityThisYear: charity.toFixed(2),
      sortedEntries: entries
    };
  }, [ledger, currentYear]);

  function toggleExpand(id) {
    setExpandedBookingId((prev) => (prev === id ? null : id));
  }

  return (
    <DashboardLayout>
      <h1>Helper Earnings</h1>
      <p>Overview of what you’ve earned and are expected to earn.</p>

      {/* Summary block */}
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          padding: "16px",
          background: "#f5f5f5",
          borderRadius: "8px",
          maxWidth: "600px",
        }}
      >
        <p><strong>Total Earned This Year:</strong> ${totalEarnedThisYear}</p>
        <p><strong>Pending Earnings:</strong> ${totalPendingThisYear}</p>
        <p><strong>Completed Earnings:</strong> ${totalCompletedThisYear}</p>
        <p><strong>Charity Contributed:</strong> ${totalCharityThisYear}</p>
      </div>

      {/* Ledger list */}
      {sortedEntries.length === 0 && (
        <p>No paid jobs recorded yet.</p>
      )}

      {sortedEntries.map((e) => {
        const date = e.completedAt || e.timestamp;
        const displayDate = date
          ? new Date(date).toLocaleString()
          : "N/A";

        const statusColor =
          e.status === "Completed" ? "green" : e.status === "Paid" ? "orange" : "gray";

        const isExpanded = expandedBookingId === e.bookingId;

        return (
          <div
            key={e.bookingId}
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "12px",
              maxWidth: "700px",
              cursor: "pointer",
            }}
            onClick={() => toggleExpand(e.bookingId)}
          >
            {/* Row header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>Job #{e.bookingId}</strong>{" "}
                <span style={{ color: statusColor }}>({e.status})</span>
                <div style={{ fontSize: "12px", color: "#555" }}>
                  {displayDate}
                </div>
              </div>

              <div>
                {e.status === "Completed" ? (
                  <span><strong>Earned:</strong> ${e.helperReceives}</span>
                ) : (
                  <span><strong>Will Earn:</strong> ${e.helperReceives}</span>
                )}
              </div>
            </div>

            {/* Dropdown details */}
            {isExpanded && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                  fontSize: "14px",
                }}
              >
                <p><strong>Base Amount:</strong> ${e.baseAmount}</p>
                <p><strong>Customer Paid:</strong> ${e.totalCustomerCharge}</p>
                <p><strong>Your Earnings:</strong> ${e.helperReceives}</p>
                <p><strong>Charity Contribution:</strong> ${e.charityAmount}</p>
                <p><strong>Estimated Stripe Fee:</strong> ${e.stripeFee}</p>
                <p>
                  <strong>PaymentIntent ID:</strong>{" "}
                  {e.paymentIntentId || "Not recorded"}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </DashboardLayout>
  );
}

export default HelperEarnings;
