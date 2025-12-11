import React, { useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger } from "../utils/ledger";

function AdminLedger() {
  const ledger = getLedger();

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
  }, [ledger]);

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
                <th style={thStyle}>Status</th>
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

                return (
                  <tr key={e.bookingId}>
                    <td style={tdStyle}>#{e.bookingId}</td>
                    <td style={tdStyle}>${e.baseAmount}</td>
                    <td style={tdStyle}>${e.totalCustomerCharge}</td>
                    <td style={tdStyle}>${e.helperReceives}</td>
                    <td style={tdStyle}>${e.platformFee}</td>
                    <td style={tdStyle}>${e.charityAmount}</td>
                    <td style={tdStyle}>${e.stripeFee}</td>
                    <td style={tdStyle}>{e.status}</td>
                    <td style={tdStyle}>{displayDate}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "12px" }}>
                        {e.paymentIntentId || "N/A"}
                      </span>
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

export default AdminLedger;
