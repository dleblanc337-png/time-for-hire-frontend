// Job Ledger Utility (Local Storage version)
// Phase 1 — Escrow Simulation

export function addLedgerEntry({ bookingId, baseAmount }) {
  const stripeFee = Number((baseAmount * 0.03).toFixed(2));
  const platformFee = Number((baseAmount * 0.05).toFixed(2));
  const charityAmount = Number((baseAmount * 0.02).toFixed(2));

  const totalCustomerCharge = Number((baseAmount * 1.10).toFixed(2)); // +10%
  const helperReceives = Number((baseAmount - baseAmount * 0.10).toFixed(2)); // -10%

  const entry = {
    bookingId,
    baseAmount,
    totalCustomerCharge,
    helperReceives,

    // Fee breakdown
    stripeFee,
    platformFee,
    charityAmount,
    totalPlatformCut: Number((stripeFee + platformFee + charityAmount).toFixed(2)),

    // Workflow
    status: "Paid", // after customer payment
    timestamp: new Date().toISOString()
  };

  // Save to localStorage ledger
  const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
  ledger.push(entry);
  localStorage.setItem("ledger", JSON.stringify(ledger));

  return entry;
}

export function getLedger() {
  return JSON.parse(localStorage.getItem("ledger") || "[]");
}
