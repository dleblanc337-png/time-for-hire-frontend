import React from "react";
import HomePage from "./HomePage";

export default function PublicHome() {
  // We REUSE your HomePage logic,
  // but we DO NOT wrap it inside DashboardLayout here.
  return (
    <div style={{ padding: "20px" }}>
      <HomePage />
    </div>
  );
}
