import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * No ../utils/api import.
 * We fetch from:
 * - REACT_APP_API_URL (if set) + /api/helpers/public
 * - otherwise /api/helpers/public (same-origin proxy)
 */
function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
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

/** Extract keywords exactly from helper-entered fields (tags/services/rawServices) */
function extractKeywordsFromHelper(helper) {
  const profile = helper?.profile || {};
  const slots = helper?.availabilitySlots || [];

  const bucket = [];

  // array tags
  (profile.serviceTags || []).forEach((t) => bucket.push(String(t || "")));

  // free text services (sometimes comma-separated)
  if (profile.services) bucket.push(String(profile.services));

  // from slots
  slots.forEach((s) => {
    if (s?.rawServices) bucket.push(String(s.rawServices));
    if (s?.services) bucket.push(String(s.services));
  });

  // split into clean keyword tokens
  const tokens = bucket
    .join(",")
    .split(/[,/|-]/g)
    .map((x) => normalizeTerm(x))
    .filter(Boolean);

  // de-dupe
  return Array.from(new Set(tokens));
}

function HomePage() {
  const [mode, setMode] = useState("looking"); // "looking" or "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [helpers, setHelpers] = useState([]);

  // UI / dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // filters (keep)
  const [radius, setRadius] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  // Load helpers/availability
  useEffect(() => {
    async function fetchHelpers() {
      try {
        const base = process.env.REACT_APP_API_URL || "";
        const url = joinUrl(base, "/api/helpers/public");
        const data = await fetchJson(url);
        const arr = Array.isArray(data) ? data : data?.data || [];
        setHelpers(arr);
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

  // Build FULL keyword list from helper-entered keywords (for dropdown)
  const allKeywords = useMemo(() => {
    const all = [];
    helpers.forEach((h) => all.push(...extractKeywordsFromHelper(h)));
    // de-dupe again, and sort nice
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [helpers]);

  // Dropdown suggestions filtered by what user typed
  const suggestions = useMemo(() => {
    const t = normalizedTerm;
    if (!t) return allKeywords.slice(0, 12);
    const filtered = allKeywords.filter((k) => k.includes(t));
    return filtered.slice(0, 12);
  }, [allKeywords, normalizedTerm]);

  // close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!showDropdown) return;
      const inInput = inputRef.current && inputRef.current.contains(e.target);
      const inDrop = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inInput && !inDrop) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showDropdown]);

  function helperMatches(helper) {
    const profile = helper.profile || {};
    const tags = (profile.serviceTags || []).map((t) => (t || "").toLowerCase());
    const slots = helper.availabilitySlots || [];

    const term = normalizedTerm;

    const matchesTerm = (textOrArray) => {
      if (!term) return true;

      if (Array.isArray(textOrArray)) {
        return textOrArray.some((t) => {
          const v = (t || "").toLowerCase();
          return v.includes(term);
        });
      }

      const v = (textOrArray || "").toLowerCase();
      return v.includes(term);
    };

    const slotServicesText = slots.map((s) => s.rawServices || s.services || "").join(" ");

    const termOk =
      matchesTerm(profile.services || "") ||
      matchesTerm(tags) ||
      matchesTerm(slotServicesText);

    if (!termOk) return false;

    // date filter
    const hasDate = slots.some((s) => s.date === selectedDate);
    if (!hasDate) return false;

    // price filter (safe if missing)
    if (maxPrice !== "any") {
      const max = Number(maxPrice);
      const slotsOnDate = slots.filter((s) => s.date === selectedDate);
      const anyWithin =
        slotsOnDate.length > 0 &&
        slotsOnDate.some((s) => {
          const r = Number(
            s.hourlyRate ??
              s.rate ??
              s.price ??
              s.hourly ??
              s.pricePerHour ??
              NaN
          );
          if (!Number.isFinite(r)) return true; // no price stored => don't block
          return r <= max;
        });
      if (!anyWithin) return false;
    }

    // radius placeholder (no geo yet)
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
    return viewMonth.toLocaleString("default", { month: "long", year: "numeric" });
  }, [viewMonth]);

  function pickSuggestion(word) {
    setSearchTerm(word);
    setShowDropdown(false);
    setActiveIndex(-1);
  }

  function onSearchKeyDown(e) {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        pickSuggestion(suggestions[activeIndex]);
      }
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div style={pageWrap}>
      <div style={layoutWrap}>
        {/* LEFT */}
        <div style={panelLeft}>
          <div style={toggleWrap}>
            <button
              onClick={() => setMode("looking")}
              style={{
                ...toggleBtn,
                background: mode === "looking" ? "#003f63" : "#fff",
                color: mode === "looking" ? "#fff" : "#003f63",
              }}
            >
              I am looking for
            </button>
            <button
              onClick={() => setMode("offering")}
              style={{
                ...toggleBtn,
                background: mode === "offering" ? "#003f63" : "#fff",
                color: mode === "offering" ? "#fff" : "#003f63",
              }}
            >
              I am offering
            </button>
          </div>

          {/* Search with dropdown */}
          <div style={{ marginBottom: 12, position: "relative" }}>
            <label style={labelStyle}>Search</label>
            <input
              ref={inputRef}
              type="text"
              placeholder="carpenter, lawn, snow..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={onSearchKeyDown}
              style={inputStyle}
              autoComplete="off"
            />

            {mode === "looking" && showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} style={dropdownStyle}>
                {suggestions.map((s, idx) => (
                  <div
                    key={s}
                    onMouseDown={(e) => {
                      // prevent input blur before click registers
                      e.preventDefault();
                      pickSuggestion(s);
                    }}
                    style={{
                      ...dropdownItem,
                      background: idx === activeIndex ? "#e7f2ff" : "#fff",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Selected date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Distance radius</label>
            <select value={radius} onChange={(e) => setRadius(e.target.value)} style={inputStyle}>
              <option value="any">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
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

          <div style={{ fontSize: 12, color: "#666" }}>
            Tip: start typing and pick a keyword from the dropdown (it’s built from helper-entered
            services).
          </div>
        </div>

        {/* CENTER */}
        <div style={panelCenter}>
          <div style={monthNav}>
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

          <table style={calendarTable}>
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <th key={d} style={calendarTh}>
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

                    return (
                      <td
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        style={{
                          ...calendarTd,
                          background: isSelected
                            ? "#ffeb3b" // ✅ yellow square
                            : inMonth
                            ? "#fff"
                            : "#f9fafb",
                          border: isSelected ? "2px solid #b59a00" : "1px solid #ddd",
                        }}
                      >
                        <div style={{ textAlign: "right" }}>{day}</div>

                        {helpersCount > 0 && (
                          <div style={availBadge}>{helpersCount} avail</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT */}
        <div style={panelRight}>
          <h3 style={{ marginTop: 0 }}>Available helpers</h3>

          {mode === "offering" && (
            <p style={{ fontSize: 13 }}>
              Helper view: switch to <strong>&quot;I am looking for&quot;</strong> to search helpers.
            </p>
          )}

          {mode === "looking" && filteredHelpers.length === 0 && (
            <p style={{ fontSize: 13 }}>
              No helpers found for this selection.
              <br />
              Try a dropdown keyword + a date with availabilities.
            </p>
          )}

          {mode === "looking" &&
            filteredHelpers.map((helper) => {
              const profile = helper.profile || {};
              const slots = (helper.availabilitySlots || []).filter((slot) => slot.date === selectedDate);

              const rawName = profile.displayName || helper.name || "Helper";
              const displayName = formatHelperName(rawName);

              return (
                <div
                  key={helper._id || helper.id || rawName}
                  style={helperCard}
                >
                  <strong>{displayName}</strong>
                  <div style={{ color: "#555", marginTop: 2 }}>
                    {profile.city || "Location not specified"}
                  </div>

                  {profile.services && (
                    <div style={{ marginTop: 4, color: "#003f63" }}>
                      {profile.services}
                    </div>
                  )}

                  {slots.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <strong>Available:</strong>
                      <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
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
    </div>
  );
}

/** Layout fills bottom (no empty grey zone) */
const pageWrap = {
  background: "#f0f2f5",
  minHeight: "calc(100vh - 80px)", // fill below header
  padding: "20px",
  boxSizing: "border-box",
};

const layoutWrap = {
  display: "flex",
  gap: 16,
  alignItems: "stretch",
  height: "100%",
};

const panelLeft = {
  width: 280,
  background: "#f6f8fb",
  padding: 16,
  borderRadius: 8,
  border: "1px solid #e0e4ee",
  boxSizing: "border-box",
};

const panelCenter = {
  flex: 1,
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  border: "1px solid #e0e4ee",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 120px)",
};

const panelRight = {
  width: 280,
  background: "#f6f8fb",
  padding: 16,
  borderRadius: 8,
  border: "1px solid #e0e4ee",
  boxSizing: "border-box",
  overflowY: "auto",
  maxHeight: "calc(100vh - 120px)",
};

const toggleWrap = {
  display: "flex",
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #ccc",
  marginBottom: 12,
};

const toggleBtn = {
  flex: 1,
  padding: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 13,
};

const inputStyle = {
  width: "100%",
  padding: 8,
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 14,
  boxSizing: "border-box",
};

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  zIndex: 10,
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 6,
  overflow: "hidden",
  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
};

const dropdownItem = {
  padding: "10px 10px",
  cursor: "pointer",
  fontSize: 14,
  borderBottom: "1px solid #f0f0f0",
};

const monthNav = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const navButtonStyle = {
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: 4,
  cursor: "pointer",
  padding: "4px 8px",
};

const calendarTable = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const calendarTh = {
  padding: "8px 0",
  borderBottom: "1px solid #ddd",
  fontSize: 13,
  background: "#f2f5f9",
};

const calendarTd = {
  position: "relative",
  height: 74,
  padding: "6px 8px",
  cursor: "pointer",
  fontSize: 12,
  verticalAlign: "top",
  boxSizing: "border-box",
};

const availBadge = {
  position: "absolute",
  left: 8,
  bottom: 6,
  fontSize: 10,
  color: "#003f63",
  background: "#e1f0ff",
  borderRadius: 999,
  padding: "2px 6px",
};

const helperCard = {
  background: "#fff",
  borderRadius: 6,
  padding: 10,
  marginBottom: 10,
  border: "1px solid #ddd",
  fontSize: 12,
};

export default HomePage;
