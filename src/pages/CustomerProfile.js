import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerProfile() {
  const [form, setForm] = useState({
    name: "Customer Test",
    email: "customertest@yourdomain.ca",
    phone: "1234567891",
    address: "123 Rue ABCD",
  });

  const [saved, setSaved] = useState(false);

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <h1>My Profile</h1>
      <p>Update your personal information below.</p>

      {/* Success Toast */}
      {saved && (
        <div
          style={{
            background: "#4BB543",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            maxWidth: "300px",
          }}
        >
          ✅ Profile updated successfully
        </div>
      )}

      <div style={{ maxWidth: "400px" }}>
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={updateForm}
          className="input"
        />

        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={updateForm}
          className="input"
        />

        <label>Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={updateForm}
          className="input"
        />

        <label>Address</label>
        <input
          name="address"
          value={form.address}
          onChange={updateForm}
          className="input"
        />

        <button
          onClick={saveProfile}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#003f63",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save Profile
        </button>
      </div>
    </DashboardLayout>
  );
}

export default CustomerProfile;
