import React, { useEffect, useMemo, useRef, useState } from "react";
import { suggestServices } from "../data/serviceKeywords";

/**
 * HomePage.js (full file)
 * - Predictive dropdown suggestions (same dataset as Profile via suggestServices)
 * - TODAY highlight is steady yellow
 * - Selected date is obvious blue fill
 * - Search + Reset (filters apply only after clicking Search)
 * - Calendar badges react to filters (keyword + price)
 * - Default view shows everything available (no filters)
 * - Render-safe: no ../utils/api import
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

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function formatHelperName(name) {
  if (!name) return "Helper";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] || "Helper";
  const lastInitial = parts.length > 1 ? `${parts[1][0].toUpperCase()}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function extractRate(slot) {
  // Try common shapes safely
  const r = Number(
    slot?.hourlyRate ??
      slot?.rate ??
      slot?.price ??
      slot?.hourly ??
      slot?.pricePerHour ??
      NaN
  );
  return Number.isFinite(r) ? r : null;
}

function termMatchesSlotAndProfile({ term, helperProfile, slotsText }) {
  if (!term) return true;

  const servicesText = String(helperProfile?.services || "").toLowerCase();
  const tags = safeArr(helperProfile?.serviceTags)
    .map((t) => String(t || "").toLowerCase())
    .filter(Boolean);

  const slotText = String(slotsText || "").toLowerCase();

  const hitServices = servicesText.includes(term);
  const hitTags = tags.some((t) => t.includes(term));
  const hitSlots = slotText.includes(term);

  return hitServices || hitTags || hitSlots;
}

// ---------- component ----------
export default function HomePage() {
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    ""; // if empty, uses same-origin

  const todayStr = useMemo(() => formatDate(new Date()), []);

  // Mode tab
  const [mode, setMode] = useState("looking"); // "looking" or "offering"

  // Draft inputs (user typing)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [radius, setRadius] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  // Applied filters (only change on Search / Reset)
  const [applied, setApplied] = useState({
    term: "",
    radius: "any",
    maxPrice: "any",
  });

  const appliedTerm = useMemo(() => normalizeTerm(applied.term), [applied.term]);

  // Calendar month view
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Data
  const [helpers, setHelpers] = useState([]);
  const [loadingHelpers, setLoadingHelpers] = useState(false);

  // Dropdown behavior
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputWrapRef = useRef(null);

  // Predictive suggestions like Profile: use the last token after comma
  const token = useMemo(() => {
    const raw = String(searchTerm || "");
    const t = raw.split(",").pop()?.trim() || "";
    return t;
  }, [searchTerm]);

  const suggestions = useMemo(() => {
    if (!token) return [];
    return safeArr(suggestServices(token)).slice(0, 12);
  }, [token]);

  function applySuggestion(s) {
    const current = String(searchTerm || "");
    const parts = current.split(",");
    parts[parts.length - 1] = s;

    const next = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join(", ");

    setSearchTerm(next ? `${next}, ` : "");
    setShowDropdown(false);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!showDropdown) return;
      const inInput = inputWrapRef.current && inputWrapRef.current.contains(e.target);
      const inDrop = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inInput && !inDrop) setShowDropdown(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showDropdown]);

  // Load helpers (public)
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingHelpers(true);
      try {
        // This endpoint already exists in your file history
        const url = joinUrl(API_BASE, "/api/helpers/public");
        const data = await fetchJson(url);

        if (!alive) return;
        // Expect array of helpers
        setHelpers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("HomePage: failed to load public helpers:", err);
        if (!alive) return;
        setHelpers([]);
      } finally {
        if (alive) setLoadingHelpers(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [API_BASE]);

  // Build calendar grid
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

  function onPrevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function onNextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  // Search / Reset
  function onSearchApply() {
    setApplied({
      term: searchTerm,
      radius,
      maxPrice,
    });
  }

  function onResetFilters() {
    setSearchTerm("");
    setRadius("any");
    setMaxPrice("any");
    setApplied({ term: "", radius: "any", maxPrice: "any" });
  }

  // Filter logic:
  // - Calendar badges: count slots by day for helpers/slots matching applied filters (term + maxPrice)
  // - Right column list: only helpers who have at least one matching slot on selectedDate
  const helperCountByDate = useMemo(() => {
    const map = {};
    if (mode !== "looking") return map;

    const max = applied.maxPrice === "any" ? null : Number(applied.maxPrice);

    helpers.forEach((h) => {
      const profile = h?.profile || {};
      const slots = safeArr(h?.availabilitySlots);

      // Build a quick slot text once (for keyword match)
      const slotsText = slots
        .map((s) => `${s?.rawServices || ""} ${s?.services || ""}`)
        .join(" ");

      // If keyword filter exists, helper must match somewhere
      const helperTermOk = termMatchesSlotAndProfile({
        term: appliedTerm,
        helperProfile: profile,
        slotsText,
      });
      if (!helperTermOk) return;

      slots.forEach((slot) => {
        if (!slot?.date) return;

        // Price filter (if missing price, allow)
        if (max !== null) {
          const r = extractRate(slot);
          if (r !== null && r > max) return;
        }

        map[slot.date] = (map[slot.date] || 0) + 1;
      });
    });

    return map;
  }, [helpers, mode, appliedTerm, applied.maxPrice]);

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];

    const max = applied.maxPrice === "any" ? null : Number(applied.maxPrice);

    return helpers.filter((h) => {
      const profile = h?.profile || {};
      const slots = safeArr(h?.availabilitySlots);

      const slotsOnDate = slots.filter((s) => s?.date === selectedDate);
      if (slotsOnDate.length === 0) return false;

      const slotsText = slots
        .map((s) => `${s?.rawServices || ""} ${s?.services || ""}`)
        .join(" ");

      // Keyword filter
      const helperTermOk = termMatchesSlotAndProfile({
        term: appliedTerm,
        helperProfile: profile,
        slotsText,
      });
      if (!helperTermOk) return false;

      // Price filter (slot-based on selected date; if missing, allow)
      if (max !== null) {
        const ok = slotsOnDate.some((s) => {
          const r = extractRate(s);
          if (r === null) return true;
          return r <= max;
        });
        if (!ok) return false;
      }

      // Radius placeholder (kept for later geo work)
      return true;
    });
  }, [helpers, mode, selectedDate, appliedTerm, applied.maxPrice]);

  // Render helpers’ slots for the selected date
  function slotsForDate(helper) {
    return safeArr(helper?.availabilitySlots).filter((s) => s?.date === selectedDate);
  }

  // Improve selected date visibility by syncing viewMonth when selectedDate changes (nice UX)
  useEffect(() => {
    const d = parseDateStr(selectedDate);
    if (!d) return;
    const newMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    // only change if different month
    if (
      newMonth.getFullYear() !== viewMonth.getFullYear() ||
      newMonth.getMonth() !== viewMonth.getMonth()
    ) {
      setViewMonth(newMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div style={styles.pageWrap}>
      <div style={styles.layoutWrap}>
        {/* LEFT FILTERS */}
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

          {/* Search input + dropdown */}
          <div style={{ marginBottom: 12, position: "relative", zIndex: 9999 }} ref={inputWrapRef}>
            <label style={styles.label}>Search</label>
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                const last = e.target.value.split(",").pop()?.trim() || "";
                setShowDropdown(last.length > 0);
              }}
              onFocus={() => {
                if (token.length > 0) setShowDropdown(true);
              }}
              placeholder="carpenter, lawn, snow..."
              style={styles.input}
            />

            {showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} style={styles.dropdown}>
                {suggestions.map((s) => (
                  <div
                    key={s}
                    style={styles.dropdownItem}
                    onClick={() => applySuggestion(s)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
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
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Max price ($/hr)</label>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={styles.input}
            >
              <option value="any">Any price</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button style={styles.primaryBtn} onClick={onSearchApply}>
              Search
            </button>
            <button style={styles.ghostBtn} onClick={onResetFilters}>
              Reset
            </button>
          </div>

          <div style={styles.tipBox}>
            Default: shows everything available. Add filters + press <strong>Search</strong> to narrow down.
          </div>

          <div style={styles.activeBox}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Active filters</div>
            <div style={styles.activeLine}>
              <strong>Date:</strong> {selectedDate}
            </div>
            <div style={styles.activeLine}>
              <strong>Keywords:</strong> {applied.term?.trim() ? applied.term.trim() : "Any"}
            </div>
            <div style={styles.activeLine}>
              <strong>Price:</strong> {applied.maxPrice === "any" ? "Any" : `≤ $${applied.maxPrice}/hr`}
            </div>
            <div style={styles.activeLine}>
              <strong>Distance:</strong> {applied.radius === "any" ? "Any" : `${applied.radius} km`}
            </div>
          </div>
        </div>

        {/* CENTER CALENDAR */}
        <div style={styles.panelCenter}>
          <div style={styles.monthNav}>
            <button style={styles.navBtn} onClick={onPrevMonth}>
              &lt;
            </button>
            <h2 style={{ margin: 0 }}>{monthLabel}</h2>
            <button style={styles.navBtn} onClick={onNextMonth}>
              &gt;
            </button>
          </div>

          <div style={styles.calendarWrap}>
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
                      const dateStr = formatDate(dayDate);
                      const inMonth = dayDate.getMonth() === viewMonth.getMonth();
                      const isToday = dateStr === todayStr; // steady
                      const isSelected = dateStr === selectedDate; // clicked

                      const helpersCount = helperCountByDate[dateStr] || 0;

                      let bg = inMonth ? "#fff" : "#f7f8fb";
                      let border = "1px solid #e2e6ef";
                      let color = inMonth ? "#222" : "#8a93a3";

                      // TODAY yellow (steady)
                      if (isToday) {
                        bg = "#fff5b5";
                        border = "2px solid #f2c200";
                        color = "#222";
                      }

                      // Selected date blue should still be obvious
                      if (isSelected) {
                        bg = "#dbeeff";
                        border = "2px solid #4b9bff";
                        color = "#0b3a66";
                      }

                      return (
                        <td
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          style={{
                            ...styles.calendarTd,
                            background: bg,
                            border,
                            color,
                          }}
                        >
                          <div style={{ textAlign: "right", fontWeight: 700 }}>
                            {dayDate.getDate()}
                          </div>

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

            {loadingHelpers && (
              <div style={{ marginTop: 10, fontSize: 13, color: "#444" }}>
                Loading helpers…
              </div>
            )}
          </div>
        </div>

        {/* RIGHT RESULTS */}
        <div style={styles.panelRight}>
          <h3 style={{ marginTop: 0 }}>Available helpers</h3>

          {mode === "offering" && (
            <p style={{ fontSize: 13 }}>
              Helper view: switch to <strong>&quot;I am looking for&quot;</strong> to search helpers as a customer.
            </p>
          )}

          {mode === "looking" && filteredHelpers.length === 0 && (
            <p style={{ fontSize: 13 }}>
              No helpers found for this selection.
              <br />
              Default shows everything available — add filters + press <strong>Search</strong> to narrow down.
            </p>
          )}

          {mode === "looking" &&
            filteredHelpers.map((helper) => {
              const profile = helper?.profile || {};
              const slots = slotsForDate(helper);

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
                    <div style={{ marginTop: 8 }}>
                      <strong>Available:</strong>
                      <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
                        {slots.map((slot) => (
                          <li key={slot?._id || slot?.id || `${slot?.startTime}-${slot?.endTime}`}>
                            {slot?.startTime}–{slot?.endTime}
                            {slot?.rawServices ? ` (${slot.rawServices})` : ""}
                            {extractRate(slot) !== null ? ` — $${extractRate(slot)}/hr` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Placeholder for “contact” – we’ll wire this to Messages next */}
                  <button
                    type="button"
                    style={styles.contactBtn}
                    onClick={() => {
                      // later: navigate to messages thread / booking
                      alert("Next step: wire this button to Messages (thread with this helper).");
                    }}
                  >
                    Contact
                  </button>
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
  },

  panelLeft: {
    width: 300,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
  },
  panelCenter: {
    flex: 1,
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
    minHeight: "calc(100vh - 120px)", // keeps calendar tall
    display: "flex",
    flexDirection: "column",
  },
  panelRight: {
    width: 300,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    boxSizing: "border-box",
    overflowY: "auto",
    maxHeight: "calc(100vh - 120px)",
  },

  toggleWrap: {
    display: "flex",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #cbd3df",
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 700,
    color: "#1b2b3a",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd3df",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #cbd3df",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
    zIndex: 99999,
    maxHeight: 220,
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f2f5",
    fontSize: 14,
  },

  primaryBtn: {
    flex: 1,
    background: "#003f63",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  ghostBtn: {
    flex: 1,
    background: "#fff",
    color: "#003f63",
    border: "1px solid #003f63",
    borderRadius: 8,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },

  tipBox: {
    fontSize: 12.5,
    color: "#4a5568",
    background: "#eef3fb",
    border: "1px solid #d5e2f6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    lineHeight: 1.35,
  },

  activeBox: {
    background: "#fff",
    border: "1px solid #dfe6f3",
    borderRadius: 10,
    padding: 12,
  },
  activeLine: {
    fontSize: 12.5,
    color: "#243041",
    marginTop: 4,
  },

  monthNav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  navBtn: {
    border: "1px solid #cbd3df",
    background: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    padding: "6px 10px",
    fontWeight: 900,
  },

  calendarWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  calendarTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "fixed",
    flex: 1,
  },
  calendarTh: {
    textAlign: "center",
    padding: "10px 0",
    fontSize: 13,
    fontWeight: 900,
    borderBottom: "1px solid #e2e6ef",
    background: "#f2f5f9",
  },
  calendarTd: {
    verticalAlign: "top",
    height: 90,
    padding: "6px 8px",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  availBadge: {
    display: "inline-block",
    marginTop: 6,
    fontSize: 11,
    color: "#003f63",
    background: "#e1f0ff",
    borderRadius: 999,
    padding: "2px 8px",
    fontWeight: 800,
  },

  helperCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    border: "1px solid #dfe6f3",
    fontSize: 13,
  },
  contactBtn: {
    width: "100%",
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #003f63",
    background: "#fff",
    color: "#003f63",
    fontWeight: 900,
    cursor: "pointer",
  },
};
