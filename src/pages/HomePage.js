import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  SERVICE_CATEGORIES,
  ALL_SERVICE_SUGGESTIONS,
} from "../data/serviceCategories";

import "../styles/calendarStyles.css";

const isoToday = new Date().toISOString().slice(0, 10);
const dateToIso = (date) => date.toISOString().slice(0, 10);

const HomePage = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

<div style={{ marginBottom: "20px" }}>
  <Link to="/login" style={{ marginRight: "10px" }}>
    <button>Login</button>
  </Link>

  <Link to="/register">
    <button>Create Account</button>
  </Link>
</div>

  // ------------------------
  // STATE
  // ------------------------
  const [helpers, setHelpers] = useState([]);
  const [results, setResults] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

  const [dateFilterIso, setDateFilterIso] = useState(isoToday);
  const [selectedDate, setSelectedDate] = useState(isoToday);

  const [showSuggestions, setShowSuggestions] = useState(false);

  // ------------------------
  // FETCH HELPERS
  // ------------------------
  const fetchHelpers = async () => {
    try {
      const res = await fetch("http://localhost:5000/helpers/all");
      const data = await res.json();
      setHelpers(data || []);
      setResults(data || []);
    } catch (err) {
      console.error("Helper fetch error:", err);
    }
  };

  // ------------------------
  // FETCH BOOKINGS FOR CALENDAR
  // ------------------------
  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/bookings/all");
      const data = await res.json();

      const events =
        (data || []).map((b) => ({
          title: b.service || "Service",
          date: b.date,
        })) || [];

      setCalendarEvents(events);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHelpers();
    fetchCalendarEvents();
  }, []);

  // ------------------------
  // FILTER HELPERS (left column)
  // ------------------------
  useEffect(() => {
    let filtered = [...helpers];

    // search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((h) => {
        const svc = (h.services || "").toLowerCase();
        const name = (h.name || "").toLowerCase();
        return svc.includes(term) || name.includes(term);
      });
    }

    // category filter
    if (selectedCategory) {
      const cat = SERVICE_CATEGORIES.find((c) => c.name === selectedCategory);
      if (cat) {
        const items = cat.items.map((i) => i.toLowerCase());
        filtered = filtered.filter((h) =>
          items.some((word) =>
            (h.services || "").toLowerCase().includes(word)
          )
        );
      }
    }

    // date availability (simple: helper.availableDays contains ISO)
    if (dateFilterIso) {
      filtered = filtered.filter(
        (h) =>
          Array.isArray(h.availableDays) &&
          h.availableDays.includes(dateFilterIso)
      );
    }

    // price
    if (minPrice !== "") {
      filtered = filtered.filter(
        (h) => Number(h.price || 0) >= Number(minPrice)
      );
    }
    if (maxPrice !== "") {
      filtered = filtered.filter(
        (h) => Number(h.price || 0) <= Number(maxPrice)
      );
    }

    // distance
    if (maxDistance !== "") {
      const dist = Number(maxDistance);
      filtered = filtered.filter((h) =>
        typeof h.distanceKm === "number" ? h.distanceKm <= dist : true
      );
    }

    setResults(filtered);
  }, [
    helpers,
    searchTerm,
    selectedCategory,
    dateFilterIso,
    minPrice,
    maxPrice,
    maxDistance,
  ]);

  // ------------------------
  // SUGGESTIONS
  // ------------------------
  const filteredSuggestions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];
    return ALL_SERVICE_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(term)
    ).slice(0, 12);
  }, [searchTerm]);

  const groupedSuggestions = useMemo(() => {
    const out = {};
    filteredSuggestions.forEach((s) => {
      if (!out[s.category]) out[s.category] = [];
      out[s.category].push(s.label);
    });
    return out;
  }, [filteredSuggestions]);

  const handleSuggestionClick = (label, category) => {
    setSearchTerm(label);
    setSelectedCategory(category);
    setShowSuggestions(false);
  };

  // ------------------------
  // CALENDAR HANDLERS
  // ------------------------
  const handleDateClick = (info) => {
    const iso = info.dateStr;
    setSelectedDate(iso);
    setDateFilterIso(iso);
  };

  const handleTodayClick = () => {
    const api = calendarRef.current?.getApi();
    if (api) api.today();

    setSelectedDate(isoToday);
    setDateFilterIso(isoToday);
  };

  // Custom classes for today & selected date
  const dayCellClassNames = (arg) => {
    const dIso = dateToIso(arg.date);
    const classes = [];
    if (dIso === isoToday) classes.push("tfh-day-today");
    if (dIso === selectedDate) classes.push("tfh-day-selected");
    return classes;
  };

  // ------------------------
  // BOOK HELPER
  // ------------------------
  const handleBookClick = (helper) => {
    navigate("/book", { state: { helper } });
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <>

      <div className="tfh-home-container">
        {/* LEFT FILTER PANEL */}
        <div className="tfh-left-panel">
          <div className="tfh-tabs-row">
            <button className="tfh-tab tfh-tab-active">I am looking for</button>
            <button
              className="tfh-tab tfh-tab-inactive"
              onClick={() => navigate("/helper/login")}
            >
              I am offering
            </button>
          </div>

          <label className="tfh-label">Search</label>
          <input
            className="tfh-input"
            type="text"
            placeholder="Search a service… (lawn, pets, cleaning)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

          {showSuggestions &&
            filteredSuggestions.length > 0 &&
            searchTerm.trim() !== "" && (
              <div className="tfh-suggestions">
                {Object.entries(groupedSuggestions).map(([cat, labels]) => (
                  <div key={cat}>
                    <div className="tfh-suggestions-header">{cat}</div>
                    {labels.map((label) => (
                      <div
                        key={label}
                        className="tfh-suggestion-item"
                        onClick={() => handleSuggestionClick(label, cat)}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

          <label className="tfh-label">Category</label>
          <select
            className="tfh-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>

          <label className="tfh-label">Price ($/hr)</label>
          <div className="tfh-price-row">
            <input
              type="number"
              placeholder="Min"
              className="tfh-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="tfh-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <label className="tfh-label">Distance (km)</label>
          <input
            type="number"
            placeholder="Max distance"
            className="tfh-input"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
          />

          <label className="tfh-label">Selected date</label>
          <input
            type="date"
            className="tfh-input"
            value={dateFilterIso}
            onChange={(e) => {
              setDateFilterIso(e.target.value);
              setSelectedDate(e.target.value);
            }}
          />
        </div>

        {/* CENTER CALENDAR */}
        <div className="tfh-center-panel">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height="78vh"
            customButtons={{
              myToday: {
                text: "Today",
                click: handleTodayClick,
              },
            }}
            headerToolbar={{
              left: "myToday prev,next",
              center: "title",
              right: "",
            }}
            dateClick={handleDateClick}
            dayCellClassNames={dayCellClassNames}
          />
        </div>

        {/* RIGHT RESULTS PANEL */}
        <div className="tfh-right-panel">
          <h3>Available helpers</h3>
          {results.length === 0 && (
            <p>No helpers found for this selection.</p>
          )}

          {results.map((h) => (
            <div key={h._id} className="tfh-helper-card">
              <h4>{h.name}</h4>
              <p>Service: {h.services}</p>
              {h.price && <p>Price: ${h.price}/hr</p>}
              <button
                className="tfh-book-button"
                onClick={() => handleBookClick(h)}
              >
                Book helper
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = {
  page: {
    display: "flex",
    maxWidth: "1400px",
    margin: "0 auto",
    gap: "20px",
    padding: "20px",
  },

  leftCol: {
    width: "300px",
    minWidth: "300px",
    background: "#f2f5fa",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #dde4ef",
    height: "82vh",
    overflowY: "auto",
  },

  calendarCol: {
    flex: 1,
  },

  rightCol: {
    width: "300px",
    minWidth: "300px",
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },

  tabActive: {
    flex: 1,
    background: "#0055aa",
    color: "white",
    borderRadius: "20px",
    padding: "8px",
    cursor: "pointer",
    border: "none",
  },

  tabInactive: {
    flex: 1,
    background: "#d9dee7",
    color: "#003366",
    borderRadius: "20px",
    padding: "8px",
    cursor: "pointer",
    border: "none",
  },

  label: {
    marginTop: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "4px",
  },

  suggestBox: {
    background: "white",
    borderRadius: "6px",
    border: "1px solid #bcc6d2",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    padding: "8px",
    marginTop: "4px",
    maxHeight: "160px",
    overflowY: "auto",
  },

  suggestHeader: {
    fontSize: "12px",
    marginTop: "6px",
    marginBottom: "3px",
    fontWeight: "bold",
    color: "#444",
  },

  suggestItem: {
    padding: "5px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  helperCard: {
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d0d9e6",
    marginBottom: "12px",
  },

  bookBtn: {
    marginTop: "6px",
    background: "#0055aa",
    border: "none",
    padding: "8px 12px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
