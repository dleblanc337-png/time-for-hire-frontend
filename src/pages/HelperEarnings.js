import React, { useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLedger } from "../utils/ledger";

function HelperEarnings() {
  const [open, setOpen] = useState(null);
  const ledger = getLedger();

  const {
    pending,
    released,
    totalPending,
    totalReleased,
    totalCharity
  } = useMemo(() => {
    const pending = [];
    const released = [];

    let totalPending = 0;
    let totalReleased = 0;
    let totalCharity = 0;

    ledger.forEach(e => {
      if (!e.helperReceives) return;

      totalCharity += Number(e.charityAmount || 0);

      if (e.payoutStatus === "pending") {
        pending.push(e);
        totalPending += Number(e.helperReceives);
      }

      if (e.payoutStatus === "released") {
        released.push(e);
        totalReleased += Number(e.helperReceives);
      }
    });

    return {
      pending,
      released,
      totalPending: totalPending.toFixed(2),
      totalReleased: totalReleased.toFixed(2),
      totalCharity: totalCharity.toFixed(2)
    };
  }, [ledger]);

  return (
    <DashboardLayout>
      <h1>My Earnings</h1>

      <div style={{ marginBottom: 20 }}>
        <Summary label="Pending (escrow)" value={`$${totalPending}`} />
        <Summary label="Paid Out" value={`$${totalReleased}`} />
        <Summary label="Charity Contributed" value={`$${totalCharity}`} />
      </div>

      <Section title="Pending Payouts">
        {pending.length === 0 && <p>No pending payouts.</p>}

        {pending.map(e => (
          <Item
            key={e.bookingId}
            e={e}
            open={open}
            setOpen={setOpen}
            color="orange"
            label="Waiting for payout (8-hour hold)"
          />
        ))}
      </Section>

      <Section title="Paid Out">
        {released.length === 0 && <p>No released earnings yet.</p>}

        {released.map(e => (
          <Item
            key={e.bookingId}
            e={e}
            open={open}
            setOpen={setOpen}
            color="green"
            label="Paid"
          />
        ))}
      </Section>
    </DashboardLayout>
  );
}

function Summary({ label, value }) {
  return (
    <div
      style={{
        display: "inline-block",
        marginRight: 14,
        padding: "10px 14px",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff"
      }}
    >
      <div style={{ fontSize: 12, color: "#444" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: 18 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 25 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Item({ e, open, setOpen, color, label }) {
  const isOpen = open === e.bookingId;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 6,
        marginBottom: 10,
        background: "#fff"
      }}
    >
      <div
        onClick={() => setOpen(isOpen ? null : e.bookingId)}
        style={{
          padding: 10,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>
          Job #{e.bookingId} — <b>${e.helperReceives}</b>{" "}
          <span style={{ color }}>{label}</span>
        </span>

        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div style={{ padding: 10, fontSize: 13, color: "#333" }}>
          <p>Base Amount: ${e.baseAmount}</p>
          <p>Platform Fee: ${e.platformFee}</p>
          <p>Charity: ${e.charityAmount}</p>
          <p>Stripe Fee: ${e.stripeFee}</p>
          <p>You Receive: <b>${e.helperReceives}</b></p>
        </div>
      )}
    </div>
  );
}

export default HelperEarnings;
