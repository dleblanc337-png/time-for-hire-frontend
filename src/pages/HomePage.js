import React, { useEffect, useMemo, useState } from "react";
import { suggestServices } from "../data/serviceKeywords";

/**
 * HomePage.js
 * - TODAY highlight steady (yellow) independent from selected date
 * - Selected date highlight blue
 * - Predictive dropdown uses SAME logic as Profile.js via suggestServices()
 * - Search (Apply) + Reset filters
 * - Calendar badges react to filters (keyword + max price)
 * - Render-safe: no ../utils/api import
 */

// ---------- small helpers ----------
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

function helperHasKeywordMatch(helper, keyword) {
  const term = normalizeTerm(keyword);
  if (!term) return true;

  const profile = helper?.profile || {};
  const tags = safeArr(profile.serviceTags).map((t) => String(t || "").toLowerCase());
  const servicesText = String(profile.services || "").toLowerCase();

  const slotText = safeArr(helper?.availabilitySlots)
    .map((s) => `${s?.rawServices || ""} ${s?.services || ""}`)
    .join(" ")
    .toLowerCase();

  const tagHit = tags.some((t) => t.includes(term));
  const servicesHit = servicesText.includes(term);
  const slotHit = slotText.includes(term);

  return tagHit || servicesHit || slotHit;
}

// ---------- component ----------
export default function HomePage() {
  // steady "today"
  const todayStr = useMemo(() => formatDate(new Date()), []);

  // UI: mode
  const [mode, setMode] = useState("looking"); // "looking" | "offering"

  // Applied filters (what the calendar/results use)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [radius, setRadius] = useState("any");   // placeholder (no geo yet)
  const [maxPrice, setMaxPrice] = useState("any");

  // Draft filters (what user edits before pressing Search/Apply)
  const [draftSearch, setDraftSearch] = useState("");
  const [draftSelectedDate, setDraftSelectedDate] = useState(todayStr);
  const [draftRadius, setDraftRadius] = useState("any");
  const [draftMaxPrice, setDraftMaxPrice] = useState("any");

  // data
  const [helpers, setHelpers] = useState([]);

  // month view
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Load helpers/availability
  useEffect(() => {
    async function load() {
      try {
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
    start.setDate(first.getDate() - first.getDay()); // Sunday

    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay())); // Saturday

    const days = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(new Date(d));
    return chunkWeeks(days);
  }, [viewMonth]);

  const monthLabel = useMemo(() => {
    return viewMonth.toLocaleString("default", { month: "long", year: "numeric" });
  }, [viewMonth]);

  // -------------------------
  // Dropdown suggestions (same pattern as Profile.js)
  // -------------------------
  const serviceToken = (draftSearch || "").split(",").pop()?.trim() || "";
  const serviceSuggestions = suggestServices(serviceToken);

  function applyServiceSuggestion(suggestion) {
    const current = draftSearch || "";
    const parts = current.split(",");
    parts[parts.length - 1] = suggestion;

    const next = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join(", ");

    // trailing comma-space to keep entering
    setDraftSearch(next ? `${next}, ` : "");
  }

  // -------------------------
  // Apply / Reset
  // -------------------------
  function onApplyFilters() {
    setSearchTerm(draftSearch);
    setSelectedDate(draftSelectedDate);
    setRadius(draftRadius);
    setMaxPrice(draftMaxPrice);
  }

  function onResetFilters() {
    setDraftSearch("");
    setDraftSelectedDate(todayStr);
    setDraftRadius("any");
    setDraftMaxPrice("any");

    setSearchTerm("");
    setSelectedDate(todayStr);
    setRadius("any");
    setMaxPrice("any");
  }

  const normalizedAppliedTerm = useMemo(() => normalizeTerm(searchTerm), [searchTerm]);

  // -------------------------
  // Filtered helpers (right column)
  // -------------------------
  function helperMatches(helper) {
    const profile = helper?.profile || {};
    const slots = safeArr(helper?.availabilitySlots);

    // must have slot on selected date
    const hasDate = slots.some((s) => s?.date === selectedDate);
    if (!hasDate) return false;

    // keyword match
    if (normalizedAppliedTerm) {
      if (!helperHasKeywordMatch(helper, normalizedAppliedTerm)) return false;
    }

    // price filter
    if (maxPrice !== "any") {
      const max = Number(maxPrice);
      const slotsOnDate = slots.filter((s) => s?.date === selectedDate);

      const ok = slotsOnDate.some((s) => {
        const r = extractRate(s);
        if (r == null) return true; // if missing, don't hide helper
        return r <= max;
      });

      if (!ok) return false;
    }

    // radius is placeholder
    void profile;
    return true;
  }

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];
    return helpers.filter((h) => helperMatches(h));
  }, [helpers, mode, selectedDate, normalizedAppliedTerm, maxPrice, radius]);

  // -------------------------
  // Calendar badge counts SHOULD be reactive to filters
  // (keyword + max price; radius still placeholder)
  // -------------------------
  const helperCountByDate = useMemo(() => {
    const map = {};
    if (mode !== "looking") return map;

    helpers.forEach((helper) => {
      // If keyword filter is active, skip helper if it doesn't match anywhere
      if (normalizedAppliedTerm && !helperHasKeywordMatch(helper, normalizedAppliedTerm)) {
        return;
      }

      safeArr(helper?.availabilitySlots).forEach((slot) => {
        if (!slot?.date) return;

        // price filter affects badges too
        if (maxPrice !== "any") {
          const max = Number(maxPrice);
          const r = extractRate(slot);
          if (r != null && r > max) return;
        }

        map[slot.date] = (map[slot.date] || 0) + 1;
      });
    });

    return map;
  }, [helpers, mode, normalizedAppliedTerm, maxPrice]);

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

          {/* Search + suggestions (Profile-style) */}
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Search</label>

            <div style={{ position: "relative" }}>
              <input
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                style={styles.input}
                placeholder="carpenter, lawn care, snow removal"
                autoComplete="off"
              />

              {mode === "looking" && serviceSuggestions.length > 0 && serviceToken.length > 0 && (
                <div style={styles.dropdown}>
                  {serviceSuggestions.map((s) => (
                    <div
                      key={s}
                      onClick={() => applyServiceSuggestion(s)}
                      style={styles.dropdownItem}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Selected date</label>
            <input
              type="date"
              value={draftSelectedDate}
              onChange={(e) => setDraftSelectedDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Distance radius</label>
            <select value={draftRadius} onChange={(e) => setDraftRadius(e.target.value)} style={styles.input}>
              <option value="any">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Max price ($/hr)</label>
            <select value={draftMaxPrice} onChange={(e) => setDraftMaxPrice(e.target.value)} style={styles.input}>
              <option value="any">Any price</option>
              <option value="20">$20/hr</option>
              <option value="30">$30/hr</option>
              <option value="40">$40/hr</option>
              <option value="50">$50/hr</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={onApplyFilters} style={styles.primaryBtn}>
              Search
            </button>
            <button onClick={onResetFilters} style={styles.secondaryBtn}>
              Reset
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
            Tip: type a keyword and pick from the dropdown (same as Profile). Press <b>Search</b> to apply filters.
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

                    const isToday = dateStr === todayStr;      // steady highlight
                    const isSelected = dateStr === selectedDate; // applied selected date

                    const helpersCount = helperCountByDate[dateStr] || 0;

                    let bg = inMonth ? "#fff" : "#f9fafb";
                    let border = "1px solid #ddd";

                    // TODAY should remain yellow unless you want selected to override.
                    // Here: selected overrides today (blue wins) like your previous behavior.
                    if (isToday) {
                      bg = "#fff5b5";
                      border = "2px solid #f2c200";
                    }
                    if (isSelected) {
                      bg = "#dbeeff";
                      border = "2px solid #67a9ff";
                    }

                    return (
                      <td
                        key={dateStr}
                        onClick={() => {
                          // clicking calendar picks date in *draft* first, then user can hit Search
                          setDraftSelectedDate(dateStr);
                        }}
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

          {/* small area under calendar so it doesn't look empty */}
          <div style={styles.summaryBox}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Active filters</div>
            <div style={{ fontSize: 13, color: "#333" }}>
              <div>
                <b>Date:</b> {selectedDate}
              </div>
              <div>
                <b>Keywords:</b> {(searchTerm || "").trim() ? searchTerm : "Any"}
              </div>
              <div>
                <b>Max price:</b> {maxPrice === "any" ? "Any" : `$${maxPrice}/hr`}
              </div>
              <div>
                <b>Distance:</b> {radius === "any" ? "Any" : `${radius} km`}
              </div>
            </div>
          </div>
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
              Try a keyword + press <b>Search</b>.
            </p>
          )}

          {mode === "looking" &&
            filteredHelpers.map((helper) => {
              const profile = helper?.profile || {};
              const slots = safeArr(helper?.availabilitySlots).filter((slot) => slot?.date === selectedDate);

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
                            {(() => {
                              const r = extractRate(slot);
                              if (r == null) return null;
                              return <span style={{ color: "#555" }}> — ${r}/hr</span>;
                            })()}
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
    minHeight: "calc(100vh - 80px)",
    padding: 20,
    boxSizing: "border-box",
  },
  layoutWrap: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
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
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },

  dropdown: {
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
    marginTop: 6,
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
  },
  dropdownItem: {
    padding: "8px 10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    background: "#fff",
  },

  primaryBtn: {
    flex: 1,
    padding: "10px 14px",
    background: "#003f63",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },
  secondaryBtn: {
    flex: 1,
    padding: "10px 14px",
    background: "#fff",
    color: "#003f63",
    border: "1px solid #003f63",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
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

  summaryBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    background: "#f6f8fb",
  },
};
