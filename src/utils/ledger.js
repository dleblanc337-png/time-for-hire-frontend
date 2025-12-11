// Get entire ledger array
export function getLedger() {
  const data = localStorage.getItem("ledger");
  return data ? JSON.parse(data) : [];
}

// Save ledger array
export function saveLedger(entries) {
  localStorage.setItem("ledger", JSON.stringify(entries));
}

// Get single ledger entry
export function getLedgerEntry(bookingId) {
  const ledger = getLedger();
  return ledger.find((e) => e.bookingId === bookingId);
}

// Add new ledger entry (used after successful payment)
export function addLedgerEntry(entry) {
  const ledger = getLedger();
  ledger.push(entry);
  saveLedger(ledger);
}

// Update a single ledger entry (used by AdminLedger actions)
export function updateLocalLedgerEntry(bookingId, updates) {
  const ledger = getLedger();
  const index = ledger.findIndex((e) => e.bookingId === bookingId);

  if (index === -1) return;

  ledger[index] = {
    ...ledger[index],
    ...updates,
  };

  saveLedger(ledger);
}
