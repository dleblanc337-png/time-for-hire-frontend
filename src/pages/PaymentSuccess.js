import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div style={styles.container}>
      <h2>🎉 Payment Successful!</h2>
      <p>Your booking has now been marked as <strong>Paid</strong>.</p>

      <Link to="/dashboard" style={styles.button}>
        Go to My Dashboard
      </Link>
    </div>
  );
};

export default PaymentSuccess;

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
