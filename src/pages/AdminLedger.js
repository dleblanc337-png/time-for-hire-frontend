import React, { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger, updateLocalLedgerEntry } from "../utils/ledger";

function AdminLedger() {
  const [refreshKey, setRefreshKey] = useState(0);
  const ledger = getLedger();

  const backendUrl =
    process.env.REACT_APP_API_URL ||
    "https://time-for-hire-backend.onrender.com";

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  // ---------------------------
  // Release payout handler
  // ---------------------------
  async function releasePayout(bookingId) {
    try {
      const res = await fetch(
        `${backendUrl}/api/payments/release-payout/${bookingId}`,
        { method: "POST" }
      );

      if (!res.ok) {
        alert("Failed to release payout.");
        return;
      }

      const data = await res.json();

      // Update local ledger (frontend copy)
      updateLocalLedgerEntry(bookingId, {
        payoutStatus: "released",
        payoutReleasedAt: new Date().toISOString(),
      });

      refresh();
      alert("Payout released successfully.");

    } catch (err) {
      console.error(err);
      alert("Error releasing payout.");
    }
  }

  // ---------------------------
  // Hold payout handler
  // ---------------------------
  async function holdPayout(bookingId) {
    try {
      const res = await fetch(
        `${backendUrl}/api/payments/hold-payout/${bookingId}`,
        { method: "POST" }
      );

      if (!res.ok) {
        alert("Failed to place payout on hold.");
        return;
      }

      const data = await res.json();

      updateLocalLedgerEntry(bookingId, {
        payoutStatus: "held",
      });

      refresh();
      alert("Payout placed on hold.");

    } catch (err) {
      console.error(err);
      alert("Error holding payout.");
    }
  }

  // ---------------------------
  // Summaries
  // ---------------------------
  const {
    totalVolume,
    totalHelper,
    totalPlatform,
    totalCharity,
    totalStripe,
    totalJobs,
    sortedEntries
  } = useMemo(() => {
    let volume = 0;
    let helper = 0;
    let platform = 0;
    let charity = 0;
    let stripe = 0;

    const entries = [...ledger].sort((a, b) => {
      const ta = new Date(a.timestamp || a.completedAt || 0).getTime();
      const tb = new Date(b.timestamp || b.completedAt || 0).getTime();
      return tb - ta;
    });

    entries.forEach((e) => {
      volume += Number(e.totalCustomerCharge || 0);
      helper += Number(e.helperReceives || 0);
      platform += Number(e.platformFee || 0);
      charity += Number(e.charityAmount || 0);
      stripe += Number(e.stripeFee || 0);
    });

    return {
      totalVolume: volume.toFixed(2),
      totalHelper: helper.toFixed(2),
      totalPlatform: platform.toFixed(2),
      totalCharity: charity.toFixed(2),
      totalStripe: stripe.toFixed(2),
      totalJobs: entries.length,
      sortedEntries: entries
    };
  }, [ledger, refreshKey]);

  return (
    <DashboardLayout>
      <h1>Admin Ledger</h1>
      <p>Internal financial overview for Time For Hire (test mode).</p>

      {/* Summary cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <SummaryCard label="Total Marketplace Volume" value={`$${totalVolume}`} />
        <SummaryCard label="Total Helper Earnings" value={`$${totalHelper}`} />
        <SummaryCard label="Total TFH Revenue" value={`$${totalPlatform}`} />
        <SummaryCard label="Total Charity Contributions" value={`$${totalCharity}`} />
        <SummaryCard label="Estimated Stripe Fees" value={`$${totalStripe}`} />
        <SummaryCard label="Total Jobs" value={totalJobs} />
      </div>

      {/* Table */}
      {sortedEntries.length === 0 ? (
        <p>No ledger entries recorded yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              maxWidth: "1000px",
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={thStyle}>Job</th>
                <th style={thStyle}>Base</th>
                <th style={thStyle}>Customer Paid</th>
                <th style={thStyle}>Helper Earns</th>
                <th style={thStyle}>TFH Cut</th>
                <th style={thStyle}>Charity</th>
                <th style={thStyle}>Stripe Fee</th>
                <th style={thStyle}>Payout Status</th>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>PaymentIntent</th>
              </tr>
            </thead>

            <tbody>
              {sortedEntries.map((e) => {
                const date = e.completedAt || e.timestamp;
                const displayDate = date
                  ? new Date(date).toLocaleString()
                  : "N/A";

                const payoutColor =
                  e.payoutStatus === "released"
                    ? "green"
                    : e.payoutStatus === "held"
                    ? "red"
                    : "orange";

                return (
                  <tr key={e.bookingId}>
                    <td style={tdStyle}>#{e.bookingId}</td>
                    <td style={tdStyle}>${e.baseAmount}</td>
                    <td style={tdStyle}>${e.totalCustomerCharge}</td>
                    <td style={tdStyle}>${e.helperReceives}</td>
                    <td style={tdStyle}>${e.platformFee}</td>
                    <td style={tdStyle}>${e.charityAmount}</td>
                    <td style={tdStyle}>${e.stripeFee}</td>

                    {/* Payout Status */}
                    <td style={{ ...tdStyle, color: payoutColor }}>
                      {e.payoutStatus}
                    </td>

                    {/* ACTIONS */}
                    <td style={tdStyle}>
                      {e.payoutStatus === "pending" && (
                        <>
                          <button
                            onClick={() => releasePayout(e.bookingId)}
                            style={buttonGreen}
                          >
                            Release Now
                          </button>

                          <button
                            onClick={() => holdPayout(e.bookingId)}
                            style={buttonRed}
                          >
                            Hold
                          </button>
                        </>
                      )}

                      {e.payoutStatus === "released" && (
                        <span style={{ color: "green" }}>✔ Paid Out</span>
                      )}

                      {e.payoutStatus === "held" && (
                        <span style={{ color: "red" }}>⛔ On Hold</span>
                      )}
                    </td>

                    <td style={tdStyle}>{displayDate}</td>
                    <td style={{ ...tdStyle, fontSize: "12px" }}>
                      {e.paymentIntentId || "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        minWidth: "180px",
        padding: "12px 14px",
        background: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
      }}
    >
      <div style={{ fontSize: "12px", color: "#555" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "8px 10px",
  border: "1px solid #ddd",
  textAlign: "left",
  fontSize: "13px",
};

const tdStyle = {
  padding: "8px 10px",
  border: "1px solid #ddd",
  fontSize: "13px",
};

const buttonGreen = {
  background: "green",
  color: "#fff",
  padding: "4px 8px",
  marginRight: "6px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};

const buttonRed = {
  background: "red",
  color: "#fff",
  padding: "4px 8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};

export default AdminLedger;
