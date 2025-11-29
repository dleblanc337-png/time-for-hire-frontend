import React from "react";
import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div style={styles.container}>
      <h2>❌ Payment Cancelled</h2>
      <p>No charges were made. You may try paying again anytime.</p>

      <Link to="/dashboard" style={styles.button}>
        Back to My Dashboard
      </Link>
    </div>
  );
};

export default PaymentCancel;

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },
  button: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 24px",
    background: "#0066cc",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
