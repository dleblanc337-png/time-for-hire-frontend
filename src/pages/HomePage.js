import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// ---------- Small helpers ----------
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[_/\\|]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ") // keep letters/numbers/spaces/hyphen
    .replace(/\s+/g, " ")
    .trim();
}

// Takes "snow removal, lawn mowing" => ["snow removal","lawn mowing"]
function splitServices(s) {
  return normalizeText(s)
    .split(",")
    .map((t) => normalizeText(t))
    .filter(Boolean);
}

// Input "snow removal," => "snow removal"
function cleanSearchTerm(s) {
  return String(s || "").replace(/,+\s*$/, "").trim();
}

function formatHelperName(fullName) {
  const n = String(fullName || "Helper").trim();
  if (!n) return "Helper";
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0] || "Helper";
  const last = parts[1] ? `${parts[1][0].toUpperCase()}.` : "";
  return `${first} ${last}`.trim();
}

// Try to extract a "start/end" from various slot shapes
function getSlotTimes(slot) {
  const s = slot || {};

  // common explicit fields
  const start =
    s.startTime ||
    s.timeFrom ||
    s.start ||
    (typeof s.time === "string" ? s.time.split("-")[0]?.trim() : null);

  const end =
    s.endTime ||
    s.timeTo ||
    s.end ||
    (typeof s.time === "string" ? s.time.split("-")[1]?.trim() : null);

  return {
    start: start || "??",
    end: end || "??",
  };
}

function getServiceTextFromSlot(slot) {
  // try all variants
  return (
    slot.rawServices ||
    slot.service ||
    slot.services ||
    slot.serviceText ||
    slot.serviceName ||
    ""
  );
}

// ---------- Predictive keyword bank ----------
const SERVICE_KEYWORDS = [
  "snow removal",
  "lawn mowing",
  "gardening",
  "landscaping",
  "carpenter",
  "handyman",
  "house cleaning",
  "car cleaning",
  "moving help",
  "painting",
  "plumbing",
  "electrical",
  "window cleaning",
  "pressure washing",
  "pet sitting",
  "dog walking",
  "babysitting",
  "tutoring",
  "delivery",
  "junk removal",
  "furniture assembly",
];

function suggestServicesFromBank(input) {
  const raw = cleanSearchTerm(input);
  const lastToken = raw.split(",").pop()?.trim() || "";
  const q = normalizeText(lastToken);
  if (!q || q.length < 1) return [];
  const out = SERVICE_KEYWORDS.filter((k) => normalizeText(k).includes(q));
  return out.slice(0, 8);
}

// Replace the last comma-token with suggestion, keep proper ", " spacing
function applySuggestionToSearch(current, suggestion) {
  const raw = String(current || "");
  const parts = raw.split(",");
  parts[parts.length - 1] = ` ${suggestion}`; // replace last token
  const next = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
  return next ? `${next}, ` : "";
}

// ---------- Component ----------
export default function HomePage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("looking"); // "looking" or "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [maxDistance, setMaxDistance] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Applied filters (so it only filters when you click Apply)
  const [applied, setApplied] = useState({
    term: "",
    date: formatDate(new Date()),
    dist: "",
    price: "",
  });

  // Suggestions UI
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calendar month view
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();
  const todayStr = formatDate(today);

  const handleOfferingClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // logged in: go to dashboard (availability)
    navigate("/availability");
  };

  useEffect(() => {
    // Load helper public list (with availability)
    const fetchHelpers = async () => {
      try {
        setLoading(true);

        // You likely already have an endpoint like this.
        // If yours differs, tell me the route name and I’ll align it.
        const res = await api.get("/public/helpers-with-availability");
        setHelpers(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Home helpers load error:", e);
        setHelpers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpers();
  }, []);

  // ----- Build calendar weeks -----
  const weeks = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const out = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    while (out.length < 6) out.push(new Array(7).fill(null));
    return out;
  }, [year, month]);

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(year, month + delta, 1));
  };

  const handleDayClick = (day) => {
    const d = new Date(year, month, day);
    setSelectedDate(formatDate(d));
  };

  // Count helpers per date (for little "X avail" pill)
  const dateHasHelpers = useMemo(() => {
    const map = {};
    for (const h of helpers) {
      const slots = h.availabilitySlots || h.availability || h.availabilitySlotsList || [];
      for (const slot of slots) {
        const date = slot.date || slot.day || slot.selectedDate;
        if (!date) continue;
        map[date] = (map[date] || 0) + 1;
      }
    }
    return map;
  }, [helpers]);

  // ----- Filtering logic -----
  function helperMatchesTerm(helper, normalizedTerm) {
    if (!normalizedTerm) return true;

    const profile = helper.profile || {};
    const profileServices = splitServices(profile.services || profile.serviceText || "");
    const profileTags = Array.isArray(profile.serviceTags)
      ? profile.serviceTags.map((t) => normalizeText(t))
      : [];

    // also check availability slot service text
    const slots = helper.availabilitySlots || [];
    const slotServiceStrings = slots.map((s) => normalizeText(getServiceTextFromSlot(s)));

    const hay = [
      ...profileServices,
      ...profileTags,
      ...slotServiceStrings,
      normalizeText(profileServices.join(" ")),
      normalizeText(profileTags.join(" ")),
    ]
      .filter(Boolean)
      .join(" ");

    // “snow removal” should match even if term includes comma etc
    return hay.includes(normalizedTerm);
  }

  function helperMatchesDate(helper, date) {
    if (!date) return true;
    const slots = helper.availabilitySlots || [];
    return slots.some((s) => (s.date || "") === date);
  }

  function helperMatchesMaxPrice(helper, priceLimit) {
    if (!priceLimit) return true;
    const limit = Number(priceLimit);
    if (!Number.isFinite(limit)) return true;

    // Prefer slot hourlyPrice if present; else profile rate if present
    const profile = helper.profile || {};
    const profRate =
      Number(profile.hourlyRate || profile.rate || profile.price || NaN);

    const slots = helper.availabilitySlots || [];
    const slotRates = slots
      .map((s) => Number(s.hourlyPrice || s.pricePerHour || s.rate || NaN))
      .filter((n) => Number.isFinite(n));

    const bestKnown = slotRates.length
      ? Math.min(...slotRates)
      : Number.isFinite(profRate)
      ? profRate
      : null;

    if (bestKnown == null) return true; // if unknown, don’t hide them
    return bestKnown <= limit;
  }

  // NOTE: distance is not implemented without lat/lng — keep it as UI only for now.
  // We’ll hook it later once we store coordinates on profiles.
  function helperMatchesDistance(_helper, _dist) {
    return true;
  }

  const suggestions = useMemo(
    () => suggestServicesFromBank(searchTerm),
    [searchTerm]
  );

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];

    const termNorm = normalizeText(cleanSearchTerm(applied.term));
    const date = applied.date;
    const dist = applied.dist;
    const price = applied.price;

    return helpers.filter((h) => {
      if (!helperMatchesDate(h, date)) return false;
      if (!helperMatchesTerm(h, termNorm)) return false;
      if (!helperMatchesDistance(h, dist)) return false;
      if (!helperMatchesMaxPrice(h, price)) return false;
      return true;
    });
  }, [helpers, mode, applied]);

  const applyFilters = () => {
    setApplied({
      term: searchTerm,
      date: selectedDate,
      dist: maxDistance,
      price: maxPrice,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate(formatDate(new Date()));
    setMaxDistance("");
    setMaxPrice("");
    setApplied({
      term: "",
      date: formatDate(new Date()),
      dist: "",
      price: "",
    });
  };

  // UI helpers
  const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 600,
    color: "#1c1c1c",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #cfd6e4",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  };

  const navButtonStyle = {
    border: "1px solid #cfd6e4",
    background: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    padding: "4px 10px",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "stretch",
        height: "calc(100vh - 130px)",
        paddingBottom: 24,
        boxSizing: "border-box",
      }}
    >
      {/* LEFT: Filters */}
      <div
        style={{
          width: 300,
          background: "#f6f8fb",
          padding: 18,
          borderRadius: 10,
          border: "1px solid #e0e4ee",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            marginBottom: 16,
            borderRadius: 999,
            overflow: "hidden",
            border: "1px solid #cfd6e4",
            background: "#fff",
          }}
        >
          <button
            onClick={() => setMode("looking")}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              background: mode === "looking" ? "#003f63" : "transparent",
              color: mode === "looking" ? "#fff" : "#003f63",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            I am looking for
          </button>
          <button
            onClick={handleOfferingClick}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              background: mode === "offering" ? "#003f63" : "transparent",
              color: mode === "offering" ? "#fff" : "#003f63",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            I am offering
          </button>
        </div>

        {/* Search with predictive dropdown */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="carpenter, lawn, snow..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // small delay so click works
              setTimeout(() => setShowSuggestions(false), 120);
            }}
            style={inputStyle}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 64,
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #cfd6e4",
                borderRadius: 8,
                overflow: "hidden",
                zIndex: 20,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              }}
            >
              {suggestions.map((s) => (
                <div
                  key={s}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchTerm((prev) => applySuggestionToSearch(prev, s));
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: 14,
                    borderBottom: "1px solid #eef2f8",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected date */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Selected date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Distance radius */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Distance radius</label>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            style={inputStyle}
          >
            <option value="">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        {/* Apply/Clear + Max price */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            onClick={applyFilters}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #003f63",
              background: "#003f63",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            style={{
              width: 92,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cfd6e4",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 800,
              color: "#003f63",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Max price ($/hr)</label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={inputStyle}
          >
            <option value="">Any price</option>
            <option value="25">Up to $25/hr</option>
            <option value="50">Up to $50/hr</option>
            <option value="75">Up to $75/hr</option>
            <option value="100">Up to $100/hr</option>
          </select>
        </div>

        <p style={{ fontSize: 11, color: "#566", marginTop: 6 }}>
          Tip: Choose a date where a helper has availability, then type a keyword
          matching their services. Click <b>Apply Filters</b> to update results.
        </p>
      </div>

      {/* MIDDLE: Calendar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
            gap: 12,
          }}
        >
          <button onClick={() => changeMonth(-1)} style={navButtonStyle}>
            {"<"}
          </button>
          <h2 style={{ margin: 0, fontWeight: 900 }}>
            {currentMonth.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <button onClick={() => changeMonth(1)} style={navButtonStyle}>
            {">"}
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid #e0e4ee",
            flex: 1,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f3fa" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "8px 0",
                    fontSize: 12,
                    borderBottom: "1px solid #e0e4ee",
                    fontWeight: 800,
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <td key={di} style={{ height: 64, border: "1px solid #f2f2f2" }} />
                    );
                  }

                  const dateObj = new Date(year, month, day);
                  const dateStr = formatDate(dateObj);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const helpersCount = dateHasHelpers[dateStr] || 0;

                  const bg = isSelected
                    ? "#e1f0ff"
                    : isToday
                    ? "#fff7c2"
                    : "#fff";

                  return (
                    <td
                      key={di}
                      onClick={() => handleDayClick(day)}
                      style={{
                        position: "relative",
                        height: 64,
                        border: `2px solid ${isToday ? "#f2b600" : "#f2f2f2"}`,
                        textAlign: "right",
                        padding: "6px 8px",
                        cursor: "pointer",
                        background: bg,
                        color: "#222",
                        fontSize: 12,
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{day}</div>

                      {helpersCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            left: 8,
                            bottom: 6,
                            fontSize: 10,
                            color: "#003f63",
                            background: "#e1f0ff",
                            borderRadius: 999,
                            padding: "2px 6px",
                            fontWeight: 800,
                          }}
                        >
                          {helpersCount} avail
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RIGHT: Available helpers */}
      <div
        style={{
          width: 320,
          background: "#f6f8fb",
          padding: 16,
          borderRadius: 10,
          border: "1px solid #e0e4ee",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10, fontWeight: 900 }}>
          Available helpers
        </h3>

        {mode === "offering" && (
          <p style={{ fontSize: 13 }}>
            Switch to <b>I am looking for</b> to search helpers.
          </p>
        )}

        {mode === "looking" && loading && <p style={{ fontSize: 13 }}>Loading…</p>}

        {mode === "looking" && !loading && filteredHelpers.length === 0 && (
          <p style={{ fontSize: 13 }}>
            No helpers found for this selection.
            <br />
            Try another keyword or date, then click <b>Apply Filters</b>.
          </p>
        )}

        {mode === "looking" &&
          filteredHelpers.map((helper) => {
            const profile = helper.profile || {};
            const slotsAll = helper.availabilitySlots || [];
            const slots = slotsAll.filter((slot) => (slot.date || "") === applied.date);

            const rawName = profile.displayName || helper.name || "Helper";
            const displayName = formatHelperName(rawName);

            const servicesRaw = profile.services || "";
            const servicesClean = splitServices(servicesRaw).join(", ");

            return (
              <div
                key={helper.id || helper._id || displayName}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                  border: "1px solid #d7deed",
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 14 }}>{displayName}</div>

                <div style={{ color: "#555", marginTop: 3 }}>
                  {profile.city || "Location not specified"}
                </div>

                {servicesClean && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 900 }}>Services:</span>{" "}
                    <span style={{ color: "#003f63" }}>{servicesClean}</span>
                  </div>
                )}

                {slots.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>Available:</div>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {slots.map((slot) => {
                        const { start, end } = getSlotTimes(slot);
                        const sv = splitServices(getServiceTextFromSlot(slot)).join(", ");
                        return (
                          <li key={slot.id || slot._id || `${start}-${end}-${sv}`}>
                            {start}–{end}
                            {sv ? ` (${sv})` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
