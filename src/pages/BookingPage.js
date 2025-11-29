import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve helper object (may be undefined)
  const helper = location.state?.helper;

  // Logged user email (if customer logged in)
  const storedEmail = localStorage.getItem("customerEmail") || "";

  // FORM STATE (hooks must always be at the top)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(storedEmail);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([""]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const backendURL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // ADD TIME SLOT
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, ""]);
  };

  // REMOVE TIME SLOT
  const removeTimeSlot = (index) => {
    if (timeSlots.length === 1) return;
    const updated = [...timeSlots];
    updated.splice(index, 1);
    setTimeSlots(updated);
  };

  // UPDATE A TIME SLOT
  const updateTimeSlot = (index, value) => {
    const updated = [...timeSlots];
    updated[index] = value;
    setTimeSlots(updated);
  };

  // SUBMIT BOOKING
  const submitBooking = async () => {
    if (!helper) {
      alert("No helper selected.");
      return;
    }

    if (!customerName || !customerEmail || !selectedDate || !timeSlots[0]) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      helperId: helper._id,
      helperName: helper.name,
      service: helper.services,
      price: helper.price,
      customerName,
      customerEmail,
      date: selectedDate,
      timeSlots,
      notes,
    };

    try {
      setLoading(true);

      const res = await fetch(`${backendURL}/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Booking successfully created!");
        navigate("/");
      } else {
        alert("Error creating booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // FALLBACK UI (must be AFTER hooks)
  if (!helper) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <h2>No helper selected</h2>
          <button style={styles.backBtn} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Book {helper.name}</h2>

        <div style={styles.section}>
          <strong>Service:</strong> {helper.services}
          <br />
          <strong>Price:</strong> ${helper.price}/hr
        </div>

        <label style={styles.label}>Your Name *</label>
        <input
          style={styles.input}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <label style={styles.label}>Your Email *</label>
        <input
          style={styles.input}
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />

        <label style={styles.label}>Select a Date *</label>
        <input
          type="date"
          style={styles.input}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <label style={styles.label}>Time Slots *</label>

        {timeSlots.map((t, index) => (
          <div key={index} style={styles.timeRow}>
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="HH:MM (ex: 14:30)"
              value={t}
              onChange={(e) => updateTimeSlot(index, e.target.value)}
            />
            <button
              style={styles.removeTimeBtn}
              onClick={() => removeTimeSlot(index)}
            >
              ✕
            </button>
          </div>
        ))}

        <button style={styles.addTimeBtn} onClick={addTimeSlot}>
          + Add another time
        </button>

        <label style={styles.label}>Notes (optional)</label>
        <textarea
          style={styles.textarea}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          style={styles.submitBtn}
          onClick={submitBooking}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Confirm Booking"}
        </button>

        <button style={styles.backLink} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default BookingPage;

/* ===========================
          STYLES
=========================== */
const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "40px",
  },

  card: {
    width: "480px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #d0d7e4",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "15px",
    color: "#003366",
  },

  section: {
    background: "#f3f7ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #d0d7f0",
  },

  label: {
    fontWeight: 600,
    marginTop: "12px",
    marginBottom: "4px",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #c5ccda",
    marginBottom: "10px",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #c5ccda",
    marginBottom: "20px",
  },

  timeRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    gap: "6px",
  },

  removeTimeBtn: {
    background: "#ffcccc",
    border: "1px solid #ff8888",
    color: "#990000",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  addTimeBtn: {
    background: "#0055aa",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
  },

  submitBtn: {
    background: "#009944",
    color: "white",
    padding: "12px",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },

  backLink: {
    marginTop: "12px",
    cursor: "pointer",
    color: "#003366",
    background: "none",
    border: "none",
  },

  backBtn: {
    padding: "10px 16px",
    background: "#0055aa",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
