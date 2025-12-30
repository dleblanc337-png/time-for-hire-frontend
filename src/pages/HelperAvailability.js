import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function HelperAvailability() {
  const [account, setAccount] = useState(null);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    services: "",
  });

  // Load account + existing slots from global helpers list
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const acc = JSON.parse(storedUser);
        setAccount(acc);

        const rawHelpers = localStorage.getItem("tfh_helpers") || "[]";
        const helpers = JSON.parse(rawHelpers);
        const helperId = acc.email;
        const me = helpers.find((h) => h.id === helperId);

        if (me && me.availabilitySlots) {
          setSlots(me.availabilitySlots);
        }
      }
    } catch (e) {
      console.error("Error loading helper availability", e);
    }
  }, []);

  function updateHelpersStorage(nextSlots) {
    if (!account?.email) return;

    const helperId = account.email;
    const rawHelpers = localStorage.getItem("tfh_helpers") || "[]";
    const helpers = JSON.parse(rawHelpers);

    const others = helpers.filter((h) => h.id !== helperId);
    const existing = helpers.find((h) => h.id === helperId) || {
      id: helperId,
      email: account.email,
      name: account.name || "",
      profile: JSON.parse(localStorage.getItem("helperProfile") || "{}"),
    };

    const updatedHelper = {
      ...existing,
      availabilitySlots: nextSlots,
    };

    const updatedHelpers = [...others, updatedHelper];
    localStorage.setItem("tfh_helpers", JSON.stringify(updatedHelpers));
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddSlot(e) {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) return;

    const servicesTags = (form.services || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newSlot = {
      id: Date.now().toString(),
      date: form.date, // YYYY-MM-DD
      startTime: form.startTime,
      endTime: form.endTime,
      services: servicesTags, // e.g. ["carpenter","lawn"]
      rawServices: form.services,
    };

    const nextSlots = [...slots, newSlot];
    setSlots(nextSlots);
    updateHelpersStorage(nextSlots);

    setForm({
      date: "",
      startTime: "",
      endTime: "",
      services: "",
    });
  }

  function handleDeleteSlot(id) {
    const nextSlots = slots.filter((s) => s.id !== id);
    setSlots(nextSlots);
    updateHelpersStorage(nextSlots);
  }

  return (
    <DashboardLayout>
      <h1>Helper Availability</h1>
      <p>
        Set concrete days and time slots where you are available, and which
        services you are willing to offer during those slots.
      </p>

      {/* FORM */}
      <form
        onSubmit={handleAddSlot}
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          maxWidth: "620px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: "0px" }}>Add availability slot</h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ flex: "1 1 140px" }}>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={labelStyle}>Start time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleFormChange}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={labelStyle}>End time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleFormChange}
              style={inputStyle}
            />
          </div>
        </div>

        <label style={labelStyle}>Services in this slot</label>
        <input
          type="text"
          name="services"
          value={form.services}
          onChange={handleFormChange}
          style={inputStyle}
          placeholder="Example: carpenter, lawn, snow removal"
        />
        <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          You can offer more than one service in the same time slot. Separate
          them with commas.
        </p>

        <button
          type="submit"
          style={{
            marginTop: "12px",
            padding: "8px 14px",
            background: "#003f63",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add Slot
        </button>
      </form>

      {/* EXISTING SLOTS */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          maxWidth: "700px",
        }}
      >
        <h3 style={{ marginTop: "0px" }}>Your availability slots</h3>

        {slots.length === 0 && (
          <p style={{ fontSize: "13px" }}>
            You have not added any availability slots yet.
          </p>
        )}

        {slots.map((slot) => (
          <div
            key={slot.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
              fontSize: "13px",
            }}
          >
            <div>
              <strong>{slot.date}</strong>{" "}
              <span>
                ({slot.startTime}–{slot.endTime})
              </span>
              {slot.rawServices && (
                <div style={{ marginTop: "4px", color: "#003f63" }}>
                  Services: {slot.rawServices}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDeleteSlot(slot.id)}
              style={{
                padding: "4px 10px",
                background: "#b00020",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

const labelStyle = {
  display: "block",
  marginTop: "10px",
  marginBottom: "4px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "6px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "13px",
};

export default HelperAvailability;
