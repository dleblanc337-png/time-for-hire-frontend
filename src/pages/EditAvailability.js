import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { suggestServices } from "../data/serviceKeywords";

// ---- helpers ----
function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

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

function normalizeTags(rawServices) {
  return String(rawServices || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default function EditAvailability() {
  const { id } = useParams(); // helperId (we use email/id stored in tfh_helpers)
  const navigate = useNavigate();

  // Load helpers list and locate helper record
  const helpers = useMemo(() => safeParse("tfh_helpers", []), []);
  const helperIndex = helpers.findIndex((h) => String(h.id) === String(id));
  const helper = helperIndex >= 0 ? helpers[helperIndex] : null;

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rawServices, setRawServices] = useState("");
  const [pricingType, setPricingType] = useState("hourly"); // "hourly" | "flat"
  const [price, setPrice] = useState(""); // number as string

  // (Gating later) — we’ll enforce verification later, not now
  // const isVerified = !!helper?.profile?.verified;

  // Predictive suggestions: last comma-separated token
  const serviceToken = rawServices.split(",").pop()?.trim() || "";
  const serviceSuggestions = suggestServices(serviceToken);

  function applyServiceSuggestion(suggestion) {
    const parts = rawServices.split(",");
    parts[parts.length - 1] = suggestion;

    const next = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join(", ");

    setRawServices(next ? `${next}, ` : "");
  }

  function persistHelpers(nextHelpers) {
    localStorage.setItem("tfh_helpers", JSON.stringify(nextHelpers));
  }

  function addSlotsToHelperWindow() {
    if (!helper) return { ok: false, msg: "Helper not found." };

    if (!date || !startTime || !endTime) {
      return { ok: false, msg: "Please select date, start time, and end time." };
    }
    if (!rawServices.trim()) {
      return { ok: false, msg: "Please enter at least 1 service keyword." };
    }

    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      return { ok: false, msg: "Please enter a valid price (ex: 35)." };
    }

    const startM = toMinutes(startTime);
    const endM = toMinutes(endTime);
    if (startM == null || endM == null) {
      return { ok: false, msg: "Invalid time format." };
    }
    if (endM <= startM) {
      return { ok: false, msg: "End time must be after start time." };
    }

    const slots = [];
    const common = {
      date,
      rawServices: rawServices.trim(),
      services: normalizeTags(rawServices), // used by HomePage search matching
      pricingType,
      price: priceNum,
    };

    if (pricingType === "hourly") {
      // Split into 1-hour blocks (end exclusive)
      for (let m = startM; m + 60 <= endM; m += 60) {
        slots.push({
          ...common,
          startTime: toTimeStr(m),
          endTime: toTimeStr(m + 60),
        });
      }

      if (slots.length === 0) {
        return {
          ok: false,
          msg: "Hourly pricing requires at least 1 hour (ex: 09:00 to 10:00).",
        };
      }
    } else {
      // Flat rate: one slot covering the full window
      slots.push({
        ...common,
        startTime,
        endTime,
      });
    }

    // Merge into helper.availabilitySlots (avoid exact duplicates by date+start+end)
    const nextHelpers = [...helpers];
    const nextHelper = { ...nextHelpers[helperIndex] };

    const existing = Array.isArray(nextHelper.availabilitySlots)
      ? [...nextHelper.availabilitySlots]
      : [];

    const key = (s) => `${s.date}|${s.startTime}|${s.endTime}`;
    const existingKeys = new Set(existing.map(key));

    const merged = [
      ...existing,
      ...slots.filter((s) => !existingKeys.has(key(s))),
    ];

    nextHelper.availabilitySlots = merged;
    nextHelpers[helperIndex] = nextHelper;

    persistHelpers(nextHelpers);

    return {
      ok: true,
      msg:
        pricingType === "hourly"
          ? `Saved ${slots.length} hourly slot(s)!`
          : "Saved 1 flat-rate window!",
    };
  }

  // Styles
  const boxStyle = { padding: 20, maxWidth: 720 };
  const fieldWrap = { marginBottom: 12 };
  const labelStyle = { fontWeight: 600, display: "block", marginBottom: 6 };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cfd6e4",
    fontSize: 14,
    boxSizing: "border-box",
  };

  if (!helper) {
    return (
      <div style={boxStyle}>
        <h1>Edit Availability</h1>
        <p>Helper not found. (Bad link or missing helper record.)</p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ padding: "10px 16px" }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <h1>Edit Availability</h1>
      <p style={{ marginTop: 6, color: "#555" }}>
        Add when you are <strong>free</strong>. Hourly pricing splits into{" "}
        <strong>1-hour blocks</strong>. Flat rate creates{" "}
        <strong>one window</strong>.
      </p>

      {/* (Gating later) */}
      {/* {!isVerified && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <strong>Verification required (coming next):</strong> soon this will be required before posting availability.
        </div>
      )} */}

      <div style={{ marginTop: 18 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Start time (when you are free)</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Service keywords</label>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={rawServices}
              onChange={(e) => setRawServices(e.target.value)}
              style={inputStyle}
              placeholder="Example: carpenter, lawn care, snow removal"
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Pricing type</label>
          <select
            value={pricingType}
            onChange={(e) => setPricingType(e.target.value)}
            style={inputStyle}
          >
            <option value="hourly">Hourly ($/hour)</option>
            <option value="flat">Flat rate (for the job)</option>
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>
            {pricingType === "hourly"
              ? "Price ($/hour)"
              : "Flat rate ($ for the job)"}
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
            placeholder={pricingType === "hourly" ? "35" : "120"}
          />
        </div>

        <button
          onClick={() => {
            const res = addSlotsToHelperWindow();
            if (!res.ok) {
              alert(res.msg);
              return;
            }
            alert(res.msg);

            // Clear for next entry
            setStartTime("");
            setEndTime("");
            setRawServices("");
            setPrice("");
            setPricingType("hourly");
          }}
          style={{
            padding: "10px 18px",
            background: "#003f63",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Save Availability Window
        </button>
      </div>
    </div>
  );
}
