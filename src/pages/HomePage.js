import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---------------- Helpers ----------------
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "Test Helper" -> "Test H."
function formatHelperName(rawName) {
  if (!rawName) return "Helper";
  const parts = rawName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

// normalize text for matching
function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[_/\\]+/g, " ")
    .replace(/[^\w\s-]+/g, " ") // remove punctuation (keep hyphen)
    .replace(/[-]+/g, " ") // treat hyphen as space
    .replace(/\s+/g, " ")
    .trim();
}

// turn "car cleaner, snow removal" => ["car cleaner", "snow removal"]
function splitCommaList(s) {
  return (s || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// unique + clean join
function cleanJoin(list) {
  const uniq = Array.from(new Set((list || []).map((x) => x.trim()).filter(Boolean)));
  return uniq.join(", ");
}

// ---------------- Service bank (shared keywords) ----------------
// Keep this list aligned with Profile + Availability keywords
const SERVICE_BANK = [
  "carpenter",
  "handyman",
  "plumber",
  "electrician",
  "painter",
  "drywall",
  "flooring",
  "tiling",
  "moving",
  "junk removal",
  "house cleaning",
  "car cleaning",
  "car detail",
  "lawn",
  "lawn care",
  "gardener",
  "gardening",
  "landscaping",
  "hedge trimming",
  "snow",
  "snow removal",
  "pressure washing",
  "window cleaning",
  "pet sitting",
  "dog walking",
];

// suggestions for the LAST comma-separated token
function suggestServices(input) {
  const token = norm(input);
  if (!token) return [];
  const hits = SERVICE_BANK.filter((s) => norm(s).includes(token));
  return hits.slice(0, 8);
}

export default function HomePage() {
  const [mode, setMode] = useState("looking"); // looking | offering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [helpers, setHelpers] = useState([]);

  const [maxDistance, setMaxDistance] = useState(""); // km
  const [maxPrice, setMaxPrice] = useState(""); // $/hr

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const todayStr = formatDate(new Date());

  const navigate = useNavigate();

const [appliedSearch, setAppliedSearch] = useState("");
const [appliedDate, setAppliedDate] = useState(formatDate(new Date()));
const [appliedMaxDistance, setAppliedMaxDistance] = useState("");
const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

function applyFilters() {
  setAppliedSearch(searchTerm);
  setAppliedDate(selectedDate);
  setAppliedMaxDistance(maxDistance);
  setAppliedMaxPrice(maxPrice);
}

function clearFilters() {
  setSearchTerm("");
  setSelectedDate(formatDate(new Date()));
  setMaxDistance("");
  setMaxPrice("");

  setAppliedSearch("");
  setAppliedDate(formatDate(new Date()));
  setAppliedMaxDistance("");
  setAppliedMaxPrice("");
}

  // Load helpers registry from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tfh_helpers") || "[]";
      setHelpers(JSON.parse(raw));
    } catch (e) {
      console.error("Error loading tfh_helpers", e);
      setHelpers([]);
    }
  }, []);

  // --- predictive suggestions for Search ---
  const lastToken = useMemo(() => {
    // last comma-separated token being typed
    const parts = (searchTerm || "").split(",");
    return (parts[parts.length - 1] || "").trim();
  }, [searchTerm]);

  const suggestions = useMemo(() => suggestServices(lastToken), [lastToken]);

  function applySuggestion(s) {
    const parts = (searchTerm || "").split(",");
    parts[parts.length - 1] = ` ${s}`; // replace last token
    const next = parts
      .map((p) => p.trim())
      .filter(Boolean)
      .join(", ");
    setSearchTerm(next + ", "); // trailing ", " so user can keep adding
  }

  // Search tokens (support multiple comma separated terms)
  const searchTokens = useMemo(() => {
    return splitCommaList(appliedSearch).map(norm).filter(Boolean);
  }, [appliedSearch]);

  // Click "I am offering"
  function handleOfferingClick() {
    setMode("offering");

    let user = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {}

    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/helper-availability");
  }

  // Does a helper match ANY token?
  function helperMatchesTokens(helper) {
    const profile = helper.profile || {};
    const slots = helper.availabilitySlots || helper.availabilitySlots || helper.availabilitySlots || helper.availabilitySlots || helper.availabilitySlots;

    // base texts
    const profileServicesText = norm(profile.services || "");
    const profileTags = (profile.serviceTags || []).map((t) => norm(t));
    const profileTagText = norm((profile.serviceTags || []).join(" "));

    // --- must have a slot on selected date (when looking) ---
    if (selectedDate) {
      const hasDate = (helper.availabilitySlots || []).some((s) => s.date === selectedDate);
      if (!hasDate) return false;
    }

    // --- distance filter ---
    if (maxDistance) {
      const maxDistNum = Number(maxDistance);
      const helperDist = profile.maxDistanceKm ?? profile.distanceKm ?? null;
      if (helperDist != null && helperDist > maxDistNum) return false;
    }

    // --- price filter ---
    // Prefer the cheapest slot price that day if present; fallback to profile hourlyRate
    if (maxPrice) {
      const maxPriceNum = Number(maxPrice);

      let bestRate = null;

      const daySlots = (helper.availabilitySlots || []).filter((s) => s.date === selectedDate);
      daySlots.forEach((s) => {
        const r = s.pricePerHour ?? s.hourlyRate ?? null;
        if (r != null) bestRate = bestRate == null ? r : Math.min(bestRate, r);
      });

      if (bestRate == null) bestRate = profile.hourlyRate ?? profile.rate ?? null;

      if (bestRate != null && bestRate > maxPriceNum) return false;
    }

    // if no tokens, match by date + filters only
    if (searchTokens.length === 0) return true;

    // matches a single token against helper profile + slot data
    const matchesOne = (tok) => {
      if (!tok) return true;

      // profile match
      const profileOk =
        profileServicesText.includes(tok) ||
        profileTagText.includes(tok) ||
        profileTags.some((t) => t.includes(tok) || tok.includes(t));

      // slot match on selectedDate
      const slotOk = (helper.availabilitySlots || []).some((slot) => {
        if (slot.date !== selectedDate) return false;

        const slotRaw = norm(slot.rawServices || "");
        const slotTags = (slot.services || []).map((t) => norm(t));
        const slotTagText = norm((slot.services || []).join(" "));

        return (
          slotRaw.includes(tok) ||
          slotTagText.includes(tok) ||
          slotTags.some((t) => t.includes(tok) || tok.includes(t))
        );
      });

      return profileOk || slotOk;
    };

    // ANY token can match
    return searchTokens.some(matchesOne);
  }

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];
    return (helpers || []).filter(helperMatchesTokens);
  }, [helpers, mode, selectedDate, maxDistance, maxPrice, searchTokens]);

  // ---------------- Calendar ----------------
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const dateHasHelpers = useMemo(() => {
    const map = {};
    (helpers || []).forEach((h) => {
      (h.availabilitySlots || []).forEach((slot) => {
        const d = slot.date;
        if (!d) return;
        map[d] = (map[d] || 0) + 1;
      });
    });
    return map;
  }, [helpers]);

  const weeks = [];
  let currentDay = 1 - firstWeekday;
  while (currentDay <= daysInMonth) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(currentDay < 1 || currentDay > daysInMonth ? null : currentDay);
      currentDay++;
    }
    weeks.push(weekDays);
  }

  function changeMonth(delta) {
    setCurrentMonth(new Date(year, month + delta, 1));
  }

  function handleDayClick(day) {
    if (!day) return;
    setSelectedDate(formatDate(new Date(year, month, day)));
  }

  // ---------------- UI styles ----------------
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#1b2a3a" };
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cfd7e6", outline: "none" };

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "stretch",
        height: "calc(100vh - 130px)",
        paddingBottom: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT: Filters */}
      <div
        style={{
          width: "260px",
          background: "#f6f8fb",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setMode("looking")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid #cfd7e6",
              background: mode === "looking" ? "#0f4c73" : "#fff",
              color: mode === "looking" ? "#fff" : "#0f4c73",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            I am looking for
          </button>

          <button
            onClick={handleOfferingClick}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid #cfd7e6",
              background: mode === "offering" ? "#0f4c73" : "#fff",
              color: mode === "offering" ? "#fff" : "#0f4c73",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            I am offering
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "12px", position: "relative" }}>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="carpenter, lawn, snow..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 68,
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #cfd7e6",
                borderRadius: 6,
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              {suggestions.map((s) => (
                <div
                  key={s}
                  onMouseDown={(e) => {
                    // onMouseDown so it applies before input loses focus
                    e.preventDefault();
                    applySuggestion(s);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eef2f7",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected date */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Selected date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Distance */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Distance radius</label>
          <select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={inputStyle}>
            <option value="">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        {/* Price */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Max price ($/hr)</label>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
  <button
    onClick={applyFilters}
    style={{
      flex: 1,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #0f4c73",
      background: "#0f4c73",
      color: "#fff",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    Apply Filters
  </button>

  <button
    onClick={clearFilters}
    style={{
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #cfd7e6",
      background: "#fff",
      color: "#0f4c73",
      fontWeight: 800,
      cursor: "pointer",
      width: 90,
    }}
  >
    Clear
  </button>
</div>

          <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={inputStyle}>
            <option value="">Any price</option>
            <option value="25">Up to $25/hr</option>
            <option value="35">Up to $35/hr</option>
            <option value="50">Up to $50/hr</option>
            <option value="75">Up to $75/hr</option>
            <option value="100">Up to $100/hr</option>
          </select>
        </div>

        <div style={{ fontSize: 12, color: "#516071", marginTop: 8 }}>
          Tip: choose a date where a helper has set availability, then type a keyword matching their services. Use filters to narrow results.
        </div>
      </div>

      {/* CENTER: Calendar */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          padding: "16px",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{ padding: "6px 10px", border: "1px solid #cfd7e6", borderRadius: 6, background: "#fff", cursor: "pointer" }}
          >
            &lt;
          </button>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            {currentMonth.toLocaleString("en-US", { month: "long" })} {year}
          </div>
          <button
            onClick={() => changeMonth(1)}
            style={{ padding: "6px 10px", border: "1px solid #cfd7e6", borderRadius: 6, background: "#fff", cursor: "pointer" }}
          >
            &gt;
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th key={d} style={{ padding: "8px", textAlign: "center", background: "#f0f4fa", fontWeight: 800 }}>
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
                    return <td key={di} style={{ border: "1px solid #eef2f7", height: 90 }} />;
                  }

                  const dateStr = formatDate(new Date(year, month, day));
                  const has = dateHasHelpers[dateStr] || 0;

                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;

                  let bg = "#fff";
                  if (isToday) bg = "#fff6cc";
                  if (has > 0) bg = "#e7f1ff";
                  if (isSelected) bg = "#cfe5ff";

                  return (
                    <td
                      key={di}
                      onClick={() => handleDayClick(day)}
                      style={{
                        border: "1px solid #eef2f7",
                        height: 90,
                        verticalAlign: "top",
                        padding: 8,
                        cursor: "pointer",
                        background: bg,
                        outline: isToday ? "2px solid #f2c94c" : "none",
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>{day}</div>
                      {has > 0 && (
                        <div style={{ fontSize: 12, color: "#1b4f8a", fontWeight: 700 }}>
                          {has} avail
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
          width: "320px",
          background: "#f6f8fb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          overflow: "auto",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Available helpers</div>

        {filteredHelpers.length === 0 ? (
          <div style={{ fontSize: 13, color: "#516071" }}>
            No helpers match your search for this date.
          </div>
        ) : (
          filteredHelpers.map((h, idx) => {
            const profile = h.profile || {};
            const fullName = profile.publicName || profile.name || "Helper";
            const displayName = formatHelperName(fullName);

            const city = profile.city || profile.location || "";
            const servicesList = splitCommaList(profile.services || "");
            const cleanServices = cleanJoin(servicesList);

            const daySlots = (h.availabilitySlots || []).filter((s) => s.date === selectedDate);

            return (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  border: "1px solid #e0e4ee",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 900 }}>{displayName}</div>
                {city && <div style={{ fontSize: 12, color: "#516071" }}>{city}</div>}

                {cleanServices && (
                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    <span style={{ fontWeight: 800 }}>Services:</span> {cleanServices}
                  </div>
                )}

                <div style={{ fontSize: 13, marginTop: 8 }}>
                  <span style={{ fontWeight: 800 }}>Available:</span>
                  <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                    {daySlots.map((s, i) => {
                      const serviceText = cleanJoin(splitCommaList(s.rawServices || ""));
                      const rate = s.pricePerHour ?? s.hourlyRate ?? null;
                      return (
                        <li key={i} style={{ marginBottom: 4 }}>
                          const start =
  s.start ||
  s.startTime ||
  s.timeFrom ||
  (typeof s.time === "string" ? s.time.split("-")[0]?.trim() : null) ||
  "??";

const end =
  s.end ||
  s.endTime ||
  s.timeTo ||
  (typeof s.time === "string" ? s.time.split("-")[1]?.trim() : null) ||
  "??";

                          {serviceText ? `(${serviceText})` : ""}
                          {rate != null ? ` — $${rate}/hr` : ""}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
