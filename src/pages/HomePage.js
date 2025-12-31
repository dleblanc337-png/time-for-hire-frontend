import React, { useEffect, useState } from "react";

// Format Date → "YYYY-MM-DD"
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Format name → "First L."
function formatHelperName(rawName) {
  if (!rawName) return "Helper";
  const parts = rawName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

function HomePage() {
  const [mode, setMode] = useState("looking"); // "looking" or "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [helpers, setHelpers] = useState([]);

  // extra filters
  const [maxDistance, setMaxDistance] = useState(""); // km
  const [maxPrice, setMaxPrice] = useState(""); // $/hr

  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load helpers registry from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tfh_helpers") || "[]";
      const parsed = JSON.parse(raw);
      setHelpers(parsed);
    } catch (e) {
      console.error("Error loading tfh_helpers", e);
    }
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  // loose matcher so "gardener" ≈ "gardening"
  function looseMatch(text) {
    if (!normalizedTerm) return true;
    const t = (text || "").toLowerCase();
    return t.includes(normalizedTerm) || normalizedTerm.includes(t);
  }

  function helperMatches(helper) {
    const profile = helper.profile || {};
    const tags = profile.serviceTags || [];
    const slots = helper.availabilitySlots || [];

    // ---- 1) services / tags match ----
    const servicesText = (profile.services || "").toLowerCase();

    const tagMatch =
      !normalizedTerm ||
      tags.some(
        (tag) =>
          tag.includes(normalizedTerm) || normalizedTerm.includes(tag)
      );

    const servicesMatch =
      !normalizedTerm || looseMatch(servicesText) || tagMatch;

    if (!servicesMatch) return false;

    // ---- 2) date + slot match ----
    if (!selectedDate) return servicesMatch;

    const slotMatch = slots.some((slot) => {
      if (slot.date !== selectedDate) return false;

      if (!normalizedTerm) return true;

      const slotTags = slot.services || [];
      const tagsOk = slotTags.some(
        (tag) =>
          tag.includes(normalizedTerm) || normalizedTerm.includes(tag)
      );

      const rawOk = looseMatch(slot.rawServices || "");
      return tagsOk || rawOk;
    });

    if (!slotMatch) return false;

    // ---- 3) distance filter (optional) ----
    // We expect something like profile.maxDistanceKm (number)
    if (maxDistance) {
      const maxDistNum = Number(maxDistance);
      const helperDist =
        profile.maxDistanceKm ??
        profile.distanceKm ??
        null; // be flexible with field name
      if (helperDist != null && helperDist > maxDistNum) {
        return false;
      }
    }

    // ---- 4) price filter (optional) ----
    // We expect something like profile.hourlyRate (number)
    if (maxPrice) {
      const maxPriceNum = Number(maxPrice);
      const rate =
        profile.hourlyRate ??
        profile.rate ??
        null; // again, flexible with naming
      if (rate != null && rate > maxPriceNum) {
        return false;
      }
    }

    return true;
  }

  const filteredHelpers =
    mode === "looking" ? helpers.filter(helperMatches) : [];

  // ---- Calendar construction ----
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-based
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Map date → how many helpers have slots that day
  const dateHasHelpers = {};
  helpers.forEach((helper) => {
    (helper.availabilitySlots || []).forEach((slot) => {
      const d = slot.date;
      if (!d) return;
      dateHasHelpers[d] = (dateHasHelpers[d] || 0) + 1;
    });
  });

  const weeks = [];
  let currentDay = 1 - firstWeekday;

  while (currentDay <= daysInMonth) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        weekDays.push(null);
      } else {
        weekDays.push(currentDay);
      }
      currentDay++;
    }
    weeks.push(weekDays);
  }

  function changeMonth(delta) {
    const newMonth = new Date(year, month + delta, 1);
    setCurrentMonth(newMonth);
  }

  function handleDayClick(day) {
    if (!day) return;
    const newDate = new Date(year, month, day);
    const formatted = formatDate(newDate);
    setSelectedDate(formatted);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "stretch",
        minHeight: "60vh",
        paddingBottom: "24px",
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
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            marginBottom: "16px",
            borderRadius: "999px",
            overflow: "hidden",
            border: "1px solid #ccc",
          }}
        >
          <button
            onClick={() => setMode("looking")}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              cursor: "pointer",
              background: mode === "looking" ? "#003f63" : "rgba(0,0,0,0)",
              color: mode === "looking" ? "#fff" : "#003f63",
              fontSize: "13px",
            }}
          >
            I am looking for
          </button>
          <button
            onClick={() => setMode("offering")}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              cursor: "pointer",
              background: mode === "offering" ? "#003f63" : "rgba(0,0,0,0)",
              color: mode === "offering" ? "#fff" : "#003f63",
              fontSize: "13px",
            }}
          >
            I am offering
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="carpenter, lawn, snow..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Selected date */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Selected date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Distance radius filter */}
        <div style={{ marginBottom: "12px" }}>
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

        {/* Max price filter */}
        <div style={{ marginBottom: "12px" }}>
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

        <p style={{ fontSize: 11, color: "#555", marginTop: "8px" }}>
          Tip: choose a date where a helper has set availability and type a
          keyword matching their services. Use filters to narrow down results.
        </p>
      </div>

      {/* MIDDLE: Calendar */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
            gap: "12px",
          }}
        >
          <button onClick={() => changeMonth(-1)} style={navButtonStyle}>
            {"<"}
          </button>
          <h2 style={{ margin: 0 }}>
            {currentMonth.toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
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
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e0e4ee",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f3fa" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "6px 0",
                    fontSize: "12px",
                    borderBottom: "1px solid #e0e4ee",
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
                      <td
                        key={di}
                        style={{
                          height: "60px",
                          border: "1px solid #f2f2f2",
                        }}
                      />
                    );
                  }

                  const dateObj = new Date(year, month, day);
                  const dateStr = formatDate(dateObj);
                  const isSelected = dateStr === selectedDate;
                  const helpersCount = dateHasHelpers[dateStr] || 0;

                  return (
                    <td
                      key={di}
                      onClick={() => handleDayClick(day)}
                      style={{
                        position: "relative",
                        height: "60px",
                        border: "1px solid #f2f2f2",
                        textAlign: "right",
                        padding: "4px 6px",
                        cursor: "pointer",
                        background: isSelected ? "#e1f0ff" : "#fff",
                        color: isSelected ? "#003f63" : "#333",
                        fontSize: "12px",
                      }}
                    >
                      {day}

                      {helpersCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            left: "6px",
                            bottom: "4px",
                            fontSize: "10px",
                            color: "#003f63",
                            background: "#e1f0ff",
                            borderRadius: "999px",
                            padding: "1px 5px",
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
          width: "260px",
          background: "#f6f8fb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Available helpers</h3>

        {mode === "offering" && (
          <p style={{ fontSize: 13 }}>
            Helper view: switch to{" "}
            <strong>&quot;I am looking for&quot;</strong> to search helpers as a
            customer.
          </p>
        )}

        {mode === "looking" && filteredHelpers.length === 0 && (
          <p style={{ fontSize: 13 }}>
            No helpers found for this selection.
            <br />
            Try another keyword or date.
          </p>
        )}

        {mode === "looking" &&
          filteredHelpers.map((helper) => {
            const profile = helper.profile || {};
            const slots = (helper.availabilitySlots || []).filter(
              (slot) => slot.date === selectedDate
            );

            const rawName = profile.displayName || helper.name || "Helper";
            const displayName = formatHelperName(rawName);

            return (
              <div
                key={helper.id}
                style={{
                  background: "#fff",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                }}
              >
                <strong>{displayName}</strong>
                <div style={{ color: "#555", marginTop: "2px" }}>
                  {profile.city || "Location not specified"}
                </div>
                {profile.services && (
                  <div
                    style={{
                      marginTop: "4px",
                      color: "#003f63",
                    }}
                  >
                    {profile.services}
                  </div>
                )}
                {slots.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    <strong>Available:</strong>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        margin: "2px 0",
                      }}
                    >
                      {slots.map((slot) => (
                        <li key={slot.id}>
                          {slot.startTime}–{slot.endTime}{" "}
                          {slot.rawServices && `(${slot.rawServices})`}
                        </li>
                      ))}
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

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const navButtonStyle = {
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "4px 8px",
};

export default HomePage;
