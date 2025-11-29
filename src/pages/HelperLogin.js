import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HelperLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/auth/helper-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!data.success) return alert("Login failed.");

    localStorage.setItem("helperEmail", email);

    if (data.needsProfile) {
      navigate("/helper/profile-setup");
    } else {
      navigate("/helper/dashboard");
    }
  };

  return (
    <div style={styles.page}>
      <h2>Helper Login</h2>
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

export default HelperLogin;

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
    background: "#00994d",
    border: "none",
    color: "white",
    cursor: "pointer"
  }
};
