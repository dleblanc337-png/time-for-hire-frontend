import React from "react";
import HomePage from "./HomePage";

function PublicHome() {
  // Public main home (no dashboard sidebar)
  return (
    <div style={{ padding: "20px" }}>
      <HomePage />
    </div>
  );
}

export default PublicHome;
