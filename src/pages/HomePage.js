import React, { useEffect, useMemo, useState } from "react";

// Safely build an API URL without depending on ../utils/api
function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`.trim());
  }
  return res.json();
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function chunkWeeks(days) {
  const weeks = [];
  let week = [];
  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);
  return weeks;
}

function normalizeTerm(term) {
  return (term || "")
    .toLowerCase()
    .replace(/[^\w\s,/-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatHelperName(name) {
  if (!name) return "Helper";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] || "Helper";
  const lastInitial = parts.length > 1 ? `${parts[1][0].toUpperCase()}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function HomePage() {
  const [mode, setMode] = useState("looking"); // "looking" or "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [helpers, setHelpers] = useState([]);

  // extra filters
  const [radius, setRadius] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  // Load helpers/availability
  useEffect(() => {
    async function fetchHelpers() {
      try {
        // If you have REACT_APP_API_URL set, it will use it (ex: https://your-backend.onrender.com)
        // Otherwise it calls same-origin "/api/..."
        const base = process.env.REACT_APP_API_URL || "";
        const url = joinUrl(base, "/api/helpers/public");
        const data = await fetchJson(url);
        setHelpers(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error("Failed to load helpers:", err);
        setHelpers([]);
      }
    }
    fetchHelpers();
  }, []);

  // Build month calendar grid
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthDays = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const last = endOfMonth(viewMonth);

    // start grid on Sunday
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    // end grid on Saturday
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));

    const days = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    return chunkWeeks(days);
  }, [viewMonth]);

  const normalizedTerm = useMemo(() => normalizeTerm(searchTerm), [searchTerm]);

  function helperMatches(helper) {
    const profile = helper.profile || {};
    const tags = (profile.serviceTags || []).map((t) => (t || "").toLowerCase());
    const slots = helper.availabilitySlots || [];

    // --- term matching helpers ---
    const term = normalizedTerm;

    const matchesTerm = (textOrArray) => {
      if (!term) return true;

      if (Array.isArray(textOrArray)) {
        return textOrArray.some((t) => {
          const v = (t || "").toLowerCase();
          return v.includes(term) || term.includes(v);
        });
      }

      const v = (textOrArray || "").toLowerCase();
      return v.includes(term) || term.includes(v);
    };

    // match against:
    // 1) helper.profile.services (string)
    // 2) helper.profile.serviceTags (array)
    // 3) availability slot rawServices / services
    const slotServicesText = slots
      .map((s) => s.rawServices || s.services || "")
      .join(" ");

    const termOk =
      matchesTerm(profile.services || "") ||
      matchesTerm(tags) ||
      matchesTerm(slotServicesText);

    if (!termOk) return false;

    // --- date filter: only keep helpers who have a slot on selectedDate ---
    const hasDate = slots.some((s) => s.date === selectedDate);
    if (!hasDate) return false;

    // --- price filter (if your slot has hourlyRate; otherwise ignore safely) ---
    if (maxPrice !== "any") {
      const max = Number(maxPrice);
      const slotsOnDate = slots.filter((s) => s.date === selectedDate);
      const anyWithin =
        slotsOnDate.length === 0
          ? false
          : slotsOnDate.some((s) => {
              const r = Number(
                s.hourlyRate ??
                  s.rate ??
                  s.price ??
                  s.hourly ??
                  s.pricePerHour ??
                  NaN
              );
              if (!Number.isFinite(r)) return true; // if no price stored yet, don't filter out
              return r <= max;
            });
      if (!anyWithin) return false;
    }

    // radius filter is placeholder until we add geo distance
    return true;
  }

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];
    return helpers.filter((h) => helperMatches(h));
  }, [helpers, mode, selectedDate, normalizedTerm, maxPrice, radius]);

  // Count helpers per day for calendar badges
  const helperCountByDate = useMemo(() => {
    const map = {};
    if (mode !== "looking") return map;

    helpers.forEach((helper) => {
      (helper.availabilitySlots || []).forEach((slot) => {
        if (!slot.date) return;
        map[slot.date] = (map[slot.date] || 0) + 1;
      });
    });

    return map;
  }, [helpers, mode]);

  const monthLabel = useMemo(() => {
    return viewMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [viewMonth]);

  const selectedDateStr = selectedDate;

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "20px",
        alignItems: "stretch",
        minHeight: "calc(100vh - 120px)",
        background: "#f0f2f5",
      }}
    >
      {/* LEFT: Search + filters */}
      <div
        style={{
          width: "260px",
          background: "#f6f8fb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          height: "100%",
        }}
      >
        {/* mode toggle */}
        <div
          style={{
            display: "flex",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid #ccc",
            marginBottom: "12px",
          }}
        >
          <button
            onClick={() => setMode("looking")}
            style={{
              flex: 1,
              padding: "10px",
              background: mode === "looking" ? "#003f63" : "#fff",
              color: mode === "looking" ? "#fff" : "#003f63",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            I am looking for
          </button>
          <button
            onClick={() => setMode("offering")}
            style={{
              flex: 1,
              padding: "10px",
              background: mode === "offering" ? "#003f63" : "#fff",
              color: mode === "offering" ? "#fff" : "#003f63",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
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
            value={selectedDateStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Radius */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Distance radius</label>
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            style={inputStyle}
          >
            <option value="any">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
          </select>
        </div>

        {/* Max price */}
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Max price ($/hr)</label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={inputStyle}
          >
            <option value="any">Any price</option>
            <option value="20">$20/hr</option>
            <option value="30">$30/hr</option>
            <option value="40">$40/hr</option>
            <option value="50">$50/hr</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Tip: choose a date where a helper has set availability, then type a
          keyword matching their services. Use filters to narrow down results.
        </div>
      </div>

      {/* CENTER: Calendar */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e0e4ee",
          height: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <button
            style={navButtonStyle}
            onClick={() => {
              const d = new Date(viewMonth);
              d.setMonth(d.getMonth() - 1);
              setViewMonth(d);
            }}
          >
            &lt;
          </button>
          <h2 style={{ margin: 0 }}>{monthLabel}</h2>
          <button
            style={navButtonStyle}
            onClick={() => {
              const d = new Date(viewMonth);
              d.setMonth(d.getMonth() + 1);
              setViewMonth(d);
            }}
          >
            &gt;
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #ddd",
                    fontSize: "13px",
                    background: "#f2f5f9",
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthDays.map((week, wIdx) => (
              <tr key={wIdx}>
                {week.map((dayDate) => {
                  const day = dayDate.getDate();
                  const dateStr = formatDate(dayDate);
                  const inMonth = dayDate.getMonth() === viewMonth.getMonth();
                  const isSelected = dateStr === selectedDate;
                  const helpersCount = helperCountByDate[dateStr] || 0;

                  const baseBg = inMonth ? "#fff" : "#f9fafb";
                  const borderColor = isSelected ? "#003f63" : "#ddd";

                  return (
                    <td
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      style={{
                        position: "relative",
                        height: "60px",
                        border: `2px solid ${borderColor}`,
                        textAlign: "right",
                        padding: "4px 6px",
                        cursor: "pointer",
                        background: baseBg,
                        color: isSelected ? "#003f63" : "#333",
                        fontSize: "12px",
                        boxSizing: "border-box",
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
          height: "100%",
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Available helpers</h3>

        {mode === "offering" && (
          <p style={{ fontSize: 13 }}>
            Helper view: switch to <strong>&quot;I am looking for&quot;</strong>{" "}
            to search helpers as a customer.
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
                key={helper._id || helper.id || rawName}
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
                  <div style={{ marginTop: "4px", color: "#003f63" }}>
                    {profile.services}
                  </div>
                )}
                {slots.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    <strong>Available:</strong>
                    <ul style={{ paddingLeft: "18px", margin: "2px 0" }}>
                      {slots.map((slot) => (
                        <li key={slot._id || slot.id || `${slot.startTime}-${slot.endTime}`}>
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
