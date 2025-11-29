import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/auth/customer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("customerEmail", email);
      navigate("/customer/dashboard");
    } else {
      alert("Error logging in.");
    }
  };

  return (
    <div style={styles.page}>
      <h2>Customer Login</h2>
      <p>Enter your email to continue</p>

      <input
        type="email"
        placeholder="your-email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleLogin} style={styles.button}>
        Continue
      </button>
    </div>
  );
};

export default CustomerLogin;

const styles = {
  page: { padding: 40, textAlign: "center" },
  input: {
    padding: 10,
    width: "300px",
    marginBottom: 15,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px 20px",
    borderRadius: 6,
    background: "#0055aa",
    border: "none",
    color: "white",
    cursor: "pointer"
  }
};
