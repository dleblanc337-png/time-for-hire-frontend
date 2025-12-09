import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem("customerProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  function handleChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  function handleSave() {
    localStorage.setItem("customerProfile", JSON.stringify(profile));
    alert("Profile saved locally ✅");
  }

  return (
    <DashboardLayout>
      <h1>My Profile</h1>
      <p>Update your personal information below.</p>

      <div style={{ maxWidth: "400px", marginTop: "20px" }}>
        <label>Name</label>
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Email</label>
        <input
          name="email"
          value={profile.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Phone</label>
        <input
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Address</label>
        <input
          name="address"
          value={profile.address}
          onChange={handleChange}
          style={inputStyle}
        />

        <button onClick={handleSave} style={buttonStyle}>
          Save Profile
        </button>
      </div>
    </DashboardLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px 16px",
  background: "#0a3c6e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default CustomerProfile;
