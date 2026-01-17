import React, { useEffect, useMemo, useRef, useState } from "react";
import { suggestServices } from "../data/serviceKeywords";

/**
 * HomePage.js (stabilized)
 * Fixes:
 * 1) Predictive dropdown works after commas (uses the LAST token you type, replaces only that token)
 * 2) Fixed header overlap while scrolling (adds top padding)
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

function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
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

function toNumOrNull(v) {
  if (v === "any") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slotPrice(slot) {
  const v = slot?.price || slot?.hourlyRate || slot?.rate;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function helperMatchesTerm(helper, termNorm) {
  if (!termNorm) return true;
  const p = helper?.profile || {};
  const hay = normalizeTerm(`${p.services || ""} ${(p.serviceTags || []).join(", ")} ${p.bio || ""}`);
  return hay.includes(termNorm);
}

function slotMatchesTerm(slot, termNorm) {
  if (!termNorm) return true;
  const hay = normalizeTerm(`${slot?.rawServices || ""} ${slot?.services || ""}`);
  return hay.includes(termNorm);
}

/**
 * IMPORTANT: parse "carpenter, garde" => last token is "garde"
 */
function getLastTokenForSuggest(fullText) {
  const raw = String(fullText || "");
  const parts = raw.split(",");
  const last = parts[parts.length - 1] ?? "";
  return normalizeTerm(last);
}

/**
 * Replace only the last token in a comma-separated list.
 * "carpenter, garde" + "gardener" => "carpenter, gardener"
 * "carpenter" + "car cleaner" => "car cleaner"
 */
function replaceLastToken(fullText, picked) {
  const raw = String(fullText || "");
  const parts = raw.split(",");
  if (parts.length === 1) return picked;
  parts[parts.length - 1] = ` ${picked}`;
  return parts.join(",").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
}

export default function HomePage() {
  const todayStr = useMemo(() => formatDate(new Date()), []);

  const [mode, setMode] = useState("looking");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [radius, setRadius] = useState("any"); // reserved for later
  const [maxPrice, setMaxPrice] = useState("any");

  const [applied, setApplied] = useState(() => ({
    term: "",
    maxPrice: "any",
    radius: "any",
  }));

  const [helpers, setHelpers] = useState([]);

  // dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // month view
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Load helpers
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

  const monthDays = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const last = endOfMonth(viewMonth);

    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));

    const days = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    return chunkWeeks(days);
  }, [viewMonth]);

  const monthLabel = useMemo(() => {
    return viewMonth.toLocaleString("default", { month: "long", year: "numeric" });
  }, [viewMonth]);

  // ---- Dropdown suggestions based on LAST token ----
  const tokenForSuggest = useMemo(() => getLastTokenForSuggest(searchTerm), [searchTerm]);

  const suggestions = useMemo(() => {
    const list = suggestServices(tokenForSuggest || "");
    return (list || []).slice(0, 8);
  }, [tokenForSuggest]);

  function pickSuggestion(word) {
    // replace only the last token, keep earlier ones
    setSearchTerm((prev) => replaceLastToken(prev, word));
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

  // ---- LIVE calendar badge counts (uses current searchTerm + maxPrice) ----
  const helperCountByDate = useMemo(() => {
    const term = normalizeTerm(tokenForSuggest ? searchTerm : searchTerm); // keep consistent
    const max = toNumOrNull(maxPrice);

    const counts = {};
    helpers.forEach((h) => {
      const slots = safeArr(h?.availabilitySlots);

      // If they type multiple comma keywords, we treat it as "any match" across keywords:
      const keywords = String(searchTerm || "")
        .split(",")
        .map((x) => normalizeTerm(x))
        .filter(Boolean);

      slots.forEach((s) => {
        const dateStr = s?.date;
        if (!dateStr) return;

        const termOk =
          keywords.length === 0
            ? true
            : keywords.some((kw) => helperMatchesTerm(h, kw) || slotMatchesTerm(s, kw));

        if (!termOk) return;

        if (max != null) {
          const p = slotPrice(s);
          if (p != null && p > max) return;
        }

        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
    });

    return counts;
  }, [helpers, searchTerm, maxPrice]);

  // ---- Right panel list (APPLIED filters, on Search button) ----
  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];

    const max = toNumOrNull(applied.maxPrice);
    const keywords = String(applied.term || "")
      .split(",")
      .map((x) => normalizeTerm(x))
      .filter(Boolean);

    return helpers
      .map((h) => {
        const slots = safeArr(h?.availabilitySlots).filter((s) => s?.date === selectedDate);

        const termOk =
          keywords.length === 0
            ? true
            : slots.some((s) => keywords.some((kw) => helperMatchesTerm(h, kw) || slotMatchesTerm(s, kw)));

        const priceOk =
          max == null
            ? true
            : slots.some((s) => {
                const p = slotPrice(s);
                return p == null || p <= max;
              });

        const hasSlots = slots.length > 0;

        return {
          ...h,
          _slotsOnSelectedDate: slots,
          _matches: hasSlots && termOk && priceOk,
        };
      })
      .filter((h) => h._matches);
  }, [helpers, selectedDate, applied.term, applied.maxPrice, mode]);

  function onSearchApply() {
    setApplied({
      term: searchTerm,
      maxPrice,
      radius,
    });
  }

  function onReset() {
    setSearchTerm("");
    setRadius("any");
    setMaxPrice("any");
    setApplied({ term: "", maxPrice: "any", radius: "any" });
    setShowDropdown(false);
    setActiveIndex(-1);
  }

  return (
    <div style={styles.pageWrap}>
      <div style={styles.layoutWrap}>
        {/* LEFT: Filters */}
        <div style={styles.panelLeft}>
          <div style={styles.toggleWrap}>
            <button
              onClick={() => setMode("looking")}
              style={{
                ...styles.toggleBtn,
                ...(mode === "looking" ? styles.toggleBtnActive : {}),
              }}
            >
              I am looking for
            </button>
            <button
              onClick={() => setMode("offering")}
              style={{
                ...styles.toggleBtn,
                ...(mode === "offering" ? styles.toggleBtnActive : {}),
              }}
            >
              I am offering
            </button>
          </div>

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

            {mode === "looking" && showDropdown && tokenForSuggest && suggestions.length > 0 && (
              <div ref={dropdownRef} style={styles.dropdown}>
                {suggestions.map((s, idx) => (
                  <div
                    key={`${s}-${idx}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickSuggestion(s);
                    }}
                    style={{
                      ...styles.dropdownItem,
                      ...(idx === activeIndex ? styles.dropdownItemActive : {}),
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
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={styles.input}>
              <option value="any">Any price</option>
              <option value="20">$20/hr</option>
              <option value="30">$30/hr</option>
              <option value="40">$40/hr</option>
              <option value="50">$50/hr</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button style={styles.primaryBtn} onClick={onSearchApply}>
              Search
            </button>
            <button style={styles.secondaryBtn} onClick={onReset}>
              Reset
            </button>
          </div>

          <div style={styles.tipBox}>
            Default: shows everything available. Add filters + press <strong>Search</strong> to narrow down.
          </div>
        </div>

        {/* CENTER: Calendar */}
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

          <div style={styles.calendarWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <th key={d} style={styles.th}>
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
                      const isToday = dateStr === todayStr;

                      const helpersCount = helperCountByDate[dateStr] || 0;

                      const baseBg = inMonth ? "#fff" : "#f5f7fb";
                      let bg = baseBg;

                      if (isToday) bg = "#fff2a8";
                      if (isSelected && !isToday) bg = "#dceeff";

                      const borderColor = isSelected ? "#2b79ff" : "#d9dee8";
                      const borderWidth = isSelected ? 2 : 1;

                      return (
                        <td
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          style={{
                            ...styles.td,
                            background: bg,
                            color: inMonth ? "#222" : "#8a93a3",
                            border: `${borderWidth}px solid ${borderColor}`,
                            scrollMarginTop: 120,
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{day}</div>

                          {helpersCount > 0 && <div style={styles.availPill}>{helpersCount} avail</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Available helpers */}
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
              const profile = helper.profile || {};
              const slots = safeArr(helper._slotsOnSelectedDate);

              const rawName = profile.displayName || helper.name || "Helper";
              const displayName = formatHelperName(rawName);

              const key = helper._id || helper.id || helper.email || `${displayName}-${Math.random()}`;

              return (
                <div key={key} style={styles.helperCard}>
                  <strong>{displayName}</strong>
                  <div style={{ color: "#555", marginTop: 2 }}>{profile.city || "Location not specified"}</div>

                  {profile.services && <div style={styles.serviceLine}>Services: {profile.services}</div>}

                  {slots.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <strong>Available:</strong>
                      <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
                        {slots.map((slot, idx) => (
                          <li key={slot._id || slot.id || `${slot.date}-${idx}`}>
                            {slot.startTime}–{slot.endTime}
                            {slot.rawServices ? ` (${slot.rawServices})` : ""}
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

const styles = {
  pageWrap: {
    background: "#f0f2f5",
    // FIX header overlap: give breathing room under fixed header
    paddingTop: 90,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  layoutWrap: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
    maxWidth: 1400,
    margin: "0 auto",
  },

  panelLeft: {
    width: 300,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    display: "flex",
    flexDirection: "column",
  },
  panelCenter: {
    flex: 1,
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    display: "flex",
    flexDirection: "column",
    minHeight: 680,
  },
  panelRight: {
    width: 300,
    background: "#f6f8fb",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e0e4ee",
    overflowY: "auto",
  },

  toggleWrap: {
    display: "flex",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #cfd6e2",
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    background: "#fff",
    color: "#003f63",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  toggleBtnActive: {
    background: "#003f63",
    color: "#fff",
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 700,
    color: "#1f2d3d",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cfd6e2",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  },

  primaryBtn: {
    flex: 1,
    background: "#003f63",
    color: "#fff",
    border: "1px solid #003f63",
    borderRadius: 10,
    padding: "12px 10px",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    background: "#fff",
    color: "#003f63",
    border: "1px solid #003f63",
    borderRadius: 10,
    padding: "12px 10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  tipBox: {
    marginTop: 12,
    fontSize: 12,
    color: "#52606d",
    background: "#f2f5f9",
    border: "1px solid #e3e8f2",
    borderRadius: 10,
    padding: 12,
    lineHeight: 1.35,
  },

  monthNav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  navBtn: {
    border: "1px solid #cfd6e2",
    background: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    padding: "6px 10px",
    fontWeight: 800,
  },

  calendarWrap: {
    flex: 1,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "fixed",
  },
  th: {
    padding: "8px 0",
    borderBottom: "1px solid #e3e8f2",
    fontSize: 13,
    background: "#f2f5f9",
  },
  td: {
    position: "relative",
    height: 92,
    verticalAlign: "top",
    padding: 10,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  availPill: {
    position: "absolute",
    left: 10,
    bottom: 10,
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
    border: "1px solid #d9dee8",
    fontSize: 13,
  },
  serviceLine: {
    marginTop: 6,
    color: "#003f63",
    fontWeight: 700,
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #cfd6e2",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
    zIndex: 99999,
  },
  dropdownItem: {
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f3f7",
    fontSize: 14,
  },
  dropdownItemActive: {
    background: "#e7f2ff",
    fontWeight: 800,
  },
};
