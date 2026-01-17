import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * HomePage.js (full file)
 * - TODAY highlight is steady (yellow) independent from selected date.
 * - Selected date highlight is blue.
 * - Predictive dropdown suggestions under Search (z-index fixed).
 * - Full-height layout (fills screen).
 * - No ../utils/api import (Render-safe).
 */

// ---------- helpers ----------
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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateStr(dateStr) {
  // YYYY-MM-DD -> Date in local time
  const [y, m, d] = String(dateStr || "").split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
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

function splitKeywords(text) {
  return String(text || "")
    .split(/[,/|-]/g)
    .map((x) => normalizeTerm(x))
    .filter(Boolean);
}

function formatHelperName(name) {
  if (!name) return "Helper";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] || "Helper";
  const lastInitial = parts.length > 1 ? `${parts[1][0].toUpperCase()}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

// ---------- component ----------
export default function HomePage() {
  // steady "today"
  const todayStr = useMemo(() => formatDate(new Date()), []);

  // UI state
  const [mode, setMode] = useState("looking"); // "looking" | "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // extra filters (kept)
  const [radius, setRadius] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  // data
  const [helpers, setHelpers] = useState([]);

  // dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const normalizedTerm = useMemo(() => normalizeTerm(searchTerm), [searchTerm]);

  // month view
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Load helpers/availability
  useEffect(() => {
    async function load() {
      try {
        // Uses env on Render if set; otherwise same-origin /api/...
        const base = process.env.REACT_APP_API_URL || "";
        const url = joinUrl(base, "/api/helpers/public");
        const data = await fetchJson(url);
        const arr = Array.isArray(data) ? data : data?.data || [];
        setHelpers(arr);
      } catch (e) {
        console.error("HomePage: failed to load helpers", e);
        setHelpers([]);
      }
    }
    load();
  }, []);

  // Calendar grid
  const monthDays = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const last = endOfMonth(viewMonth);

    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay()); // sunday

    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay())); // saturday

    const days = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    return chunkWeeks(days);
  }, [viewMonth]);

  const monthLabel = useMemo(() => {
    return viewMonth.toLocaleString("default", { month: "long", year: "numeric" });
  }, [viewMonth]);

  // Build keywords for dropdown based on helper-entered fields
  const allKeywords = useMemo(() => {
    const set = new Set();

    helpers.forEach((h) => {
      const p = h?.profile || {};
      const slots = safeArr(h?.availabilitySlots);

      // profile.serviceTags
      safeArr(p.serviceTags).forEach((t) => {
        const v = normalizeTerm(t);
        if (v) set.add(v);
      });

      // profile.services (free text)
      splitKeywords(p.services).forEach((v) => set.add(v));

      // availability slot services
      slots.forEach((s) => {
        splitKeywords(s?.rawServices).forEach((v) => set.add(v));
        splitKeywords(s?.services).forEach((v) => set.add(v));
      });
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [helpers]);

  const suggestions = useMemo(() => {
    const t = normalizedTerm;
    if (!t) return allKeywords.slice(0, 12);
    return allKeywords.filter((k) => k.includes(t)).slice(0, 12);
  }, [allKeywords, normalizedTerm]);

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
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        pickSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

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

  // helper counts per day (badge)
  const helperCountByDate = useMemo(() => {
    const map = {};
    if (mode !== "looking") return map;

    helpers.forEach((helper) => {
      safeArr(helper?.availabilitySlots).forEach((slot) => {
        if (!slot?.date) return;
        map[slot.date] = (map[slot.date] || 0) + 1;
      });
    });

    return map;
  }, [helpers, mode]);

  function helperMatches(helper) {
    const profile = helper?.profile || {};
    const slots = safeArr(helper?.availabilitySlots);

    // must have a slot on selected date
    const hasDate = slots.some((s) => s?.date === selectedDate);
    if (!hasDate) return false;

    // term matching: profile services, tags, slot services
    const term = normalizedTerm;
    if (term) {
      const tags = safeArr(profile.serviceTags).map((t) => String(t || "").toLowerCase());
      const servicesText = String(profile.services || "").toLowerCase();

      const slotText = slots
        .map((s) => `${s?.rawServices || ""} ${s?.services || ""}`)
        .join(" ")
        .toLowerCase();

      const tagHit = tags.some((t) => t.includes(term));
      const servicesHit = servicesText.includes(term);
      const slotHit = slotText.includes(term);

      if (!tagHit && !servicesHit && !slotHit) return false;
    }

    // price filter (safe)
    if (maxPrice !== "any") {
      const max = Number(maxPrice);
      const slotsOnDate = slots.filter((s) => s?.date === selectedDate);

      // If prices missing, we allow through (don’t hide helper)
      const ok = slotsOnDate.some((s) => {
        const r = Number(
          s?.hourlyRate ??
            s?.rate ??
            s?.price ??
            s?.hourly ??
            s?.pricePerHour ??
            NaN
        );
        if (!Number.isFinite(r)) return true;
        return r <= max;
      });

      if (!ok) return false;
    }

    // radius filter placeholder (no geo)
    return true;
  }

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];
    return helpers.filter((h) => helperMatches(h));
  }, [helpers, mode, selectedDate, normalizedTerm, maxPrice, radius]);

  // ---------- render ----------
  return (
    <div style={styles.pageWrap}>
      <div style={styles.layoutWrap}>
        {/* LEFT */}
        <div style={styles.panelLeft}>
          <div style={styles.toggleWrap}>
            <button
              onClick={() => setMode("looking")}
              style={{
                ...styles.toggleBtn,
                background: mode === "looking" ? "#003f63" : "#fff",
                color: mode === "looking" ? "#fff" : "#003f63",
              }}
            >
              I am looking for
            </button>
            <button
              onClick={() => setMode("offering")}
              style={{
                ...styles.toggleBtn,
                background: mode === "offering" ? "#003f63" : "#fff",
                color: mode === "offering" ? "#fff" : "#003f63",
              }}
            >
              I am offering
            </button>
          </div>

          {/* Search + dropdown */}
          <div style={{ marginBottom: 12, position: "relative", zIndex: 9999 }}>
            <label style={styles.label}>Search</label>
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
              style={styles.input}
              autoComplete="off"
            />

            {mode === "looking" && showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} style={styles.dropdown}>
                {suggestions.map((s, idx) => (
                  <div
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent blur before click
                      pickSuggestion(s);
                    }}
                    style={{
                      ...styles.dropdownItem,
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
            <label style={styles.label}>Selected date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Distance radius</label>
            <select value={radius} onChange={(e) => setRadius(e.target.value)} style={styles.input}>
              <option value="any">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Max price ($/hr)</label>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={styles.input}
            >
              <option value="any">Any price</option>
              <option value="20">$20/hr</option>
              <option value="30">$30/hr</option>
              <option value="40">$40/hr</option>
              <option value="50">$50/hr</option>
            </select>
          </div>

          <div style={{ fontSize: 12, color: "#666" }}>
            Tip: start typing and pick a keyword from the dropdown (it uses helper-entered services).
          </div>
        </div>

        {/* CENTER */}
        <div style={styles.panelCenter}>
          <div style={styles.monthNav}>
            <button
              style={styles.navBtn}
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
              style={styles.navBtn}
              onClick={() => {
                const d = new Date(viewMonth);
                d.setMonth(d.getMonth() + 1);
                setViewMonth(d);
              }}
            >
              &gt;
            </button>
          </div>

          <table style={styles.calendarTable}>
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <th key={d} style={styles.calendarTh}>
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

                    const isToday = dateStr === todayStr; // steady highlight
                    const isSelected = dateStr === selectedDate; // clicked/selected

                    const helpersCount = helperCountByDate[dateStr] || 0;

                    // Priority: Selected (blue) should still be visible even if it’s today.
                    // (If you want today always win, swap order.)
                    let bg = inMonth ? "#fff" : "#f9fafb";
                    let border = "1px solid #ddd";

                    if (isToday) {
                      bg = "#fff5b5"; // steady TODAY yellow
                      border = "2px solid #f2c200";
                    }
                    if (isSelected) {
                      bg = "#dbeeff"; // selected date blue
                      border = "2px solid #67a9ff";
                    }

                    return (
                      <td
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        style={{
                          ...styles.calendarTd,
                          background: bg,
                          border,
                        }}
                      >
                        <div style={{ textAlign: "right" }}>{day}</div>

                        {helpersCount > 0 && (
                          <div style={styles.availBadge}>{helpersCount} avail</div>
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
        <div style={styles.panelRight}>
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
              const profile = helper?.profile || {};
              const slots = safeArr(helper?.availabilitySlots).filter(
                (slot) => slot?.date === selectedDate
              );

              const rawName = profile.displayName || helper?.name || "Helper";
              const displayName = formatHelperName(rawName);

              return (
                <div key={helper?._id || helper?.id || rawName} style={styles.helperCard}>
                  <strong>{displayName}</strong>
                  <div style={{ color: "#555", marginTop: 2 }}>
                    {profile.city || "Location not specified"}
                  </div>

                  {profile.services && (
                    <div style={{ marginTop: 4, color: "#003f63" }}>{profile.services}</div>
                  )}

                  {slots.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <strong>Available:</strong>
                      <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
                        {slots.map((slot) => (
                          <li key={slot?._id || slot?.id || `${slot?.startTime}-${slot?.endTime}`}>
                            {slot?.startTime}–{slot?.endTime}{" "}
                            {slot?.rawServices && `(${slot.rawServices})`}
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

// ---------- styles ----------
const styles = {
  pageWrap: {
    background: "#f0f2f5",
    minHeight: "calc(100vh - 80px)", // fill below header
    padding: 20,
    boxSizing: "border-box",
  },
  layoutWrap: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
    height: "100%",
  },

  panelLeft: {
    width: 280,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
  },
  panelCenter: {
    flex: 1,
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
    minHeight: "calc(100vh - 120px)",
  },
  panelRight: {
    width: 280,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
    overflowY: "auto",
    maxHeight: "calc(100vh - 120px)",
  },

  toggleWrap: {
    display: "flex",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #ccc",
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },

  label: {
    display: "block",
    marginBottom: 4,
    fontSize: 13,
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
    zIndex: 99999,
    maxHeight: 260,
    overflowY: "auto",
  },
  dropdownItem: {
    padding: 10,
    cursor: "pointer",
    borderBottom: "1px solid #f1f1f1",
    fontSize: 14,
  },

  monthNav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  navBtn: {
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: 4,
    cursor: "pointer",
    padding: "4px 8px",
  },

  calendarTable: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  calendarTh: {
    padding: "8px 0",
    borderBottom: "1px solid #ddd",
    fontSize: 13,
    background: "#f2f5f9",
  },
  calendarTd: {
    position: "relative",
    height: 74,
    padding: "6px 8px",
    cursor: "pointer",
    fontSize: 12,
    verticalAlign: "top",
    boxSizing: "border-box",
  },

  availBadge: {
    position: "absolute",
    left: 8,
    bottom: 6,
    fontSize: 10,
    color: "#003f63",
    background: "#e1f0ff",
    borderRadius: 999,
    padding: "2px 6px",
  },

  helperCard: {
    background: "#fff",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    border: "1px solid #ddd",
    fontSize: 12,
  },
};
