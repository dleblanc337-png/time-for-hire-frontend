import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { suggestServices } from "../data/serviceKeywords";

function HelperAvailability() {
  const [account, setAccount] = useState(null);
  const [slots, setSlots] = useState([]);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    services: "",
    pricingType: "hourly", // "hourly" | "flat"
    price: "", // number as string
  });

  // Load current user + their existing availability slots from tfh_helpers
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
    const existing =
      helpers.find((h) => h.id === helperId) || {
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

  // ---- predictive dropdown (last comma-separated token) ----
  const serviceToken = (form.services || "").split(",").pop()?.trim() || "";
  const serviceSuggestions = suggestServices(serviceToken);

  function applyServiceSuggestion(suggestion) {
    const parts = (form.services || "").split(",");
    parts[parts.length - 1] = suggestion;

    const next = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join(", ");

    setForm((prev) => ({ ...prev, services: next ? `${next}, ` : "" }));
  }

  // ---- helpers for splitting hourly ----
  function toMinutes(t) {
    const [h, m] = String(t || "").split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  function toTimeStr(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function normalizeTags(raw) {
    return String(raw || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  function handleAddSlot(e) {
    e.preventDefault();

    if (!form.date || !form.startTime || !form.endTime) {
      alert("Please enter date, start time and end time.");
      return;
    }
    if (!form.services.trim()) {
      alert("Please enter at least 1 service keyword.");
      return;
    }

    const priceNum = Number(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price (ex: 35).");
      return;
    }

    const servicesTags = normalizeTags(form.services);

    // Option 1 logic:
    // - hourly => split into 1-hour blocks
    // - flat => one slot for the entire window
    const newSlots = [];

    if (form.pricingType === "hourly") {
      const startM = toMinutes(form.startTime);
      const endM = toMinutes(form.endTime);
      if (startM == null || endM == null) {
        alert("Invalid time format.");
        return;
      }
      if (endM <= startM) {
        alert("End time must be after start time.");
        return;
      }

      // split into 1-hour blocks (end exclusive)
      for (let m = startM; m + 60 <= endM; m += 60) {
        newSlots.push({
          id: `${Date.now()}-${m}`,
          date: form.date,
          startTime: toTimeStr(m),
          endTime: toTimeStr(m + 60),
          services: servicesTags,
          rawServices: form.services.trim(),
          pricingType: "hourly",
          price: priceNum,
        });
      }

      if (newSlots.length === 0) {
        alert("Hourly pricing requires at least 1 hour (ex: 09:00 to 10:00).");
        return;
      }
    } else {
      // flat rate: one slot for entire window
      newSlots.push({
        id: `${Date.now()}`,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        services: servicesTags,
        rawServices: form.services.trim(),
        pricingType: "flat",
        price: priceNum,
      });
    }

    // Merge: avoid exact duplicates (date+start+end)
    const key = (s) => `${s.date}|${s.startTime}|${s.endTime}`;
    const existingKeys = new Set(slots.map(key));
    const merged = [...slots, ...newSlots.filter((s) => !existingKeys.has(key(s)))];

    setSlots(merged);
    updateHelpersStorage(merged);

    setForm({
      date: "",
      startTime: "",
      endTime: "",
      services: "",
      pricingType: "hourly",
      price: "",
    });

    alert(
      form.pricingType === "hourly"
        ? `Saved ${newSlots.length} hourly slot(s)!`
        : "Saved 1 flat-rate window!"
    );
  }

  function handleDeleteSlot(id) {
    const nextSlots = slots.filter((s) => s.id !== id);
    setSlots(nextSlots);
    updateHelpersStorage(nextSlots);
  }

  return (
    <DashboardLayout>
      <h1>My Availability</h1>
      <p>
        Add concrete days and time windows where you are available. Hourly pricing
        splits into <strong>1-hour blocks</strong>. Flat rate creates{" "}
        <strong>one</strong> window.
      </p>

      {/* FORM */}
      <form
        onSubmit={handleAddSlot}
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          maxWidth: "720px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: "0px" }}>Add availability</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <label style={labelStyle}>Start time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleFormChange}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: "1 1 150px" }}>
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

        <div style={{ marginTop: 10 }}>
          <label style={labelStyle}>Service keywords</label>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              name="services"
              value={form.services}
              onChange={handleFormChange}
              style={inputStyle}
              placeholder="Example: carpenter, lawn, snow removal"
              autoComplete="off"
            />

            {serviceSuggestions.length > 0 && serviceToken.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  zIndex: 9999,
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {serviceSuggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => applyServiceSuggestion(s)}
                    style={{
                      padding: "8px 10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Separate services with commas. Click a suggestion to auto-fill.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          <div style={{ flex: "1 1 220px" }}>
            <label style={labelStyle}>Pricing type</label>
            <select
              name="pricingType"
              value={form.pricingType}
              onChange={handleFormChange}
              style={inputStyle}
            >
              <option value="hourly">Hourly ($/hour)</option>
              <option value="flat">Flat rate (for the job)</option>
            </select>
          </div>

          <div style={{ flex: "1 1 220px" }}>
            <label style={labelStyle}>
              {form.pricingType === "hourly" ? "Price ($/hour)" : "Flat rate ($ for the job)"}
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              style={inputStyle}
              min="1"
              step="1"
              placeholder={form.pricingType === "hourly" ? "35" : "120"}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "12px",
            padding: "10px 16px",
            background: "#003f63",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Save Availability
        </button>
      </form>

      {/* EXISTING SLOTS */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          maxWidth: "820px",
        }}
      >
        <h3 style={{ marginTop: "0px" }}>Your availability</h3>

        {slots.length === 0 && (
          <p style={{ fontSize: "13px" }}>
            You have not added any availability yet.
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
              gap: 12,
            }}
          >
            <div>
              <strong>{slot.date}</strong>{" "}
              <span>
                ({slot.startTime}–{slot.endTime})
              </span>

              {slot.rawServices && (
                <div style={{ marginTop: 4, color: "#003f63" }}>
                  Services: {slot.rawServices}
                </div>
              )}

              {slot.price && (
                <div style={{ marginTop: 4, color: "#222" }}>
                  Price:{" "}
                  <strong>
                    ${slot.price}
                    {slot.pricingType === "hourly" ? "/hr" : " flat"}
                  </strong>
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteSlot(slot.id)}
              style={{
                padding: "6px 10px",
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
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "13px",
};

export default HelperAvailability;
