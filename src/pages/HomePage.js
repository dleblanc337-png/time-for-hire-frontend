import React, { useEffect, useMemo, useState } from "react";

// ----------------------------
// Helpers (no external imports)
// ----------------------------
function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function splitCommaList(s) {
  return String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function parseTimeRange(slot) {
  // supports many legacy formats
  const start =
    slot.start ||
    slot.startTime ||
    slot.timeFrom ||
    (typeof slot.time === "string" ? slot.time.split("-")[0]?.trim() : null) ||
    (typeof slot.timeRange === "string"
      ? slot.timeRange.split("-")[0]?.trim()
      : null) ||
    "??";

  const end =
    slot.end ||
    slot.endTime ||
    slot.timeTo ||
    (typeof slot.time === "string" ? slot.time.split("-")[1]?.trim() : null) ||
    (typeof slot.timeRange === "string"
      ? slot.timeRange.split("-")[1]?.trim()
      : null) ||
    "??";

  return { start, end };
}

// Build a single list of service suggestions from all helpers + their availability services
function buildServiceBank(helpers) {
  const bag = [];

  helpers.forEach((h) => {
    const profile = h.profile || {};
    const tags = Array.isArray(profile.serviceTags)
      ? profile.serviceTags
      : splitCommaList(profile.services);

    tags.forEach((t) => bag.push(norm(t)));

    const slots = Array.isArray(h.availabilitySlots)
      ? h.availabilitySlots
      : Array.isArray(h.availability)
      ? h.availability
      : [];

    slots.forEach((s) => {
      if (s.service) bag.push(norm(s.service));
      if (s.services) splitCommaList(s.services).forEach((x) => bag.push(norm(x)));
    });
  });

  return uniq(bag).filter(Boolean).sort();
}

function suggestServices(bank, input) {
  const q = norm(input);
  if (!q) return [];
  return bank
    .filter((x) => x.includes(q))
    .slice(0, 8);
}

// Does helper have availability on appliedDate + match tokens?
function helperMatches(helper, appliedDate, tokens, maxDistance, maxPrice) {
  const profile = helper.profile || {};
  const helperCity = profile.city || helper.city || "";

  // availability array name compatibility
  const slots = Array.isArray(helper.availabilitySlots)
    ? helper.availabilitySlots
    : Array.isArray(helper.availability)
    ? helper.availability
    : [];

  // must have at least one slot that matches date + tokens + filters
  const ok = slots.some((s) => {
    const slotDate = s.date || s.day || s.selectedDate || s.selected_date;
    if (appliedDate && slotDate && String(slotDate) !== String(appliedDate)) return false;

    // token matching: against slot.service and helper's profile services/tags
    const slotService = norm(s.service || "");
    const profileTags = Array.isArray(profile.serviceTags)
      ? profile.serviceTags.map(norm)
      : splitCommaList(profile.services).map(norm);

    const matchesTokens =
      tokens.length === 0 ||
      tokens.some((t) => slotService.includes(t) || profileTags.some((pt) => pt.includes(t)));

    if (!matchesTokens) return false;

    // distance filter (you may later wire real distances; for now: city presence)
    if (maxDistance && maxDistance !== "any" && !helperCity) return false;

    // price filter: check hourly fields if present
    if (maxPrice && maxPrice !== "any") {
      const hourly =
        s.hourlyRate ||
        s.rate ||
        s.pricePerHour ||
        s.price ||
        s.hourly ||
        null;

      if (hourly != null) {
        const n = Number(hourly);
        const max = Number(maxPrice);
        if (!Number.isNaN(n) && !Number.isNaN(max) && n > max) return false;
      }
    }

    return true;
  });

  return ok;
}

// ----------------------------
// Component
// ----------------------------
export default function HomePage() {
  const [mode, setMode] = useState("looking"); // "looking" | "offering"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [maxDistance, setMaxDistance] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  // Applied filters (button driven)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDate, setAppliedDate] = useState(formatDate(new Date()));
  const [appliedMaxDistance, setAppliedMaxDistance] = useState("any");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("any");

  const [helpers, setHelpers] = useState([]);

  // load helpers from localStorage (your current data source)
  useEffect(() => {
    const list = safeParse("tfh_helpers", []);
    setHelpers(Array.isArray(list) ? list : []);
  }, []);

  const serviceBank = useMemo(() => buildServiceBank(helpers), [helpers]);

  // suggestions for the last comma token
  const lastToken = useMemo(() => {
    const parts = String(searchTerm || "").split(",");
    return norm(parts[parts.length - 1] || "");
  }, [searchTerm]);

  const suggestions = useMemo(
    () => suggestServices(serviceBank, lastToken),
    [serviceBank, lastToken]
  );

  function applySuggestion(s) {
    const parts = String(searchTerm || "").split(",");
    parts[parts.length - 1] = ` ${s}`;
    const cleaned = parts
      .map((p) => p.trim())
      .filter(Boolean)
      .join(", ");
    setSearchTerm(cleaned + ", ");
  }

  function applyFilters() {
    // remove trailing comma annoyance on apply
    const cleaned = String(searchTerm || "").replace(/,\s*$/, "");
    setSearchTerm(cleaned);

    setAppliedSearch(cleaned);
    setAppliedDate(selectedDate);
    setAppliedMaxDistance(maxDistance);
    setAppliedMaxPrice(maxPrice);
  }

  function clearFilters() {
    const today = formatDate(new Date());
    setSearchTerm("");
    setSelectedDate(today);
    setMaxDistance("any");
    setMaxPrice("any");

    setAppliedSearch("");
    setAppliedDate(today);
    setAppliedMaxDistance("any");
    setAppliedMaxPrice("any");
  }

  const tokens = useMemo(() => splitCommaList(appliedSearch).map(norm), [appliedSearch]);

  const filteredHelpers = useMemo(() => {
    if (mode !== "looking") return [];
    return (helpers || []).filter((h) =>
      helperMatches(h, appliedDate, tokens, appliedMaxDistance, appliedMaxPrice)
    );
  }, [helpers, mode, appliedDate, tokens, appliedMaxDistance, appliedMaxPrice]);

  // ----------------------------
  // UI Styles (kept simple)
  // ----------------------------
  const page = { background: "#f5f7fb", minHeight: "100vh" };
  const wrap = { display: "grid", gridTemplateColumns: "320px 1fr 360px", gap: 18, padding: 18 };
  const card = { background: "#fff", borderRadius: 10, border: "1px solid #e4eaf3", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" };
  const left = { ...card, padding: 14 };
  const center = { ...card, padding: 14, overflow: "auto" };
  const right = { ...card, padding: 14 };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#0b2a3a", marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cfd7e6", outline: "none" };
  const selectStyle = { ...inputStyle, background: "#fff" };
  const pillRow = { display: "flex", gap: 10, marginBottom: 12 };
  const pill = (active) => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${active ? "#0f4c73" : "#cfd7e6"}`,
    background: active ? "#0f4c73" : "#fff",
    color: active ? "#fff" : "#0f4c73",
    fontWeight: 800,
    cursor: "pointer",
  });

  return (
    <div style={page}>
      <div style={wrap}>
        {/* LEFT FILTER PANEL */}
        <div style={left}>
          <div style={pillRow}>
            <button style={pill(mode === "looking")} onClick={() => setMode("looking")}>
              I am looking for
            </button>
            <button style={pill(mode === "offering")} onClick={() => setMode("offering")}>
              I am offering
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 12, position: "relative" }}>
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
                  left: 0,
                  right: 0,
                  top: 74,
                  background: "#fff",
                  border: "1px solid #cfd7e6",
                  borderRadius: 10,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  zIndex: 10,
                  overflow: "hidden",
                }}
              >
                {suggestions.map((s) => (
                  <div
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySuggestion(s);
                    }}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eef2f8",
                      fontWeight: 700,
                      color: "#0b2a3a",
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
            <select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} style={selectStyle}>
              <option value="any">Any distance</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          {/* Max price */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Max price ($/hr)</label>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={selectStyle}>
              <option value="any">Any price</option>
              <option value="20">$20/hr</option>
              <option value="30">$30/hr</option>
              <option value="40">$40/hr</option>
              <option value="50">$50/hr</option>
              <option value="75">$75/hr</option>
              <option value="100">$100/hr</option>
            </select>

            {/* Apply / Clear buttons */}
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
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Apply Filters
              </button>

              <button
                onClick={clearFilters}
                style={{
                  width: 90,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cfd7e6",
                  background: "#fff",
                  color: "#0f4c73",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#4a5b6a", lineHeight: 1.4 }}>
            Tip: choose a date where a helper has set availability, then type a keyword matching their services.
            Use filters to narrow down results.
          </div>
        </div>

        {/* CENTER CALENDAR PLACEHOLDER (keeping your existing calendar elsewhere is fine) */}
        <div style={center}>
          <div style={{ fontWeight: 900, fontSize: 28, textAlign: "center", padding: "16px 0" }}>
            January 2026
          </div>
          <div style={{ color: "#6b7a88", textAlign: "center", paddingBottom: 12 }}>
            (calendar rendering unchanged — this file only stabilizes filtering + display)
          </div>
        </div>

        {/* RIGHT RESULTS */}
        <div style={right}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Available helpers</div>

          {mode !== "looking" ? (
            <div style={{ color: "#6b7a88" }}>
              “I am offering” mode will later show your helper setup flow.
            </div>
          ) : filteredHelpers.length === 0 ? (
            <div style={{ color: "#6b7a88" }}>No helpers match the filters.</div>
          ) : (
            filteredHelpers.map((h, idx) => {
              const profile = h.profile || {};
              const name = profile.publicName || h.publicName || "Helper";
              const city = profile.city || h.city || "";

              const services = Array.isArray(profile.serviceTags)
                ? profile.serviceTags.join(", ")
                : (profile.services || "").replace(/,\s*$/, "");

              const slots = Array.isArray(h.availabilitySlots)
                ? h.availabilitySlots
                : Array.isArray(h.availability)
                ? h.availability
                : [];

              const todays = slots.filter((s) => {
                const d = s.date || s.day || s.selectedDate || s.selected_date;
                return !appliedDate || String(d) === String(appliedDate);
              });

              return (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #e4eaf3",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{name}</div>
                  <div style={{ color: "#6b7a88", marginBottom: 6 }}>{city}</div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 900 }}>Services:</span>{" "}
                    {services || "—"}
                  </div>

                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>Available:</div>
                    {todays.length === 0 ? (
                      <div style={{ color: "#6b7a88" }}>No slots for this date.</div>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {todays.slice(0, 5).map((s, i) => {
                          const { start, end } = parseTimeRange(s);
                          const svc = String(s.service || "").replace(/,\s*$/, "");
                          return (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {start}–{end} ({svc || "service"})
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
