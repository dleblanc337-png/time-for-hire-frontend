import React, { useState } from "react";

const API_URL = "https://time-for-hire-backend.onrender.com/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
   const response = await fetch("https://time-for-hire-backend.onrender.com/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
});

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created! You can now log in.");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Create Account</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
