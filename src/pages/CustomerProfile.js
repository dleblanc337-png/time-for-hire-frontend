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

      {saved && (
        <div style={successBox}>
          ✅ Profile updated successfully
        </div>
      )}

      {/* ✅ CLEAN VERTICAL COLUMN */}
      <div style={columnWrap}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={updateForm} style={input} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={updateForm} style={input} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={updateForm} style={input} />

        <label>Address</label>
        <input name="address" value={form.address} onChange={updateForm} style={input} />

        <button onClick={saveProfile} style={saveBtn}>
          Save Profile
        </button>
      </div>
    </DashboardLayout>
  );
}

const columnWrap = {
  maxWidth: "380px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const input = {
  padding: "8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const saveBtn = {
  marginTop: "10px",
  padding: "10px",
  background: "#003f63",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const successBox = {
  background: "#4BB543",
  color: "white",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "12px",
  maxWidth: "300px",
};

export default CustomerProfile;
