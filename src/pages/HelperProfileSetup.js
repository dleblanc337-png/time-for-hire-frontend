import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HelperProfileSetup = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("helperEmail");

  const [name, setName] = useState("");
  const [services, setServices] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availableDays, setAvailableDays] = useState([]);

  // LOAD EXISTING DATA
  useEffect(() => {
    if (!email) navigate("/login-helper");

    const loadProfile = async () => {
      const res = await fetch(`http://localhost:5000/helpers/profile/${email}`);
      const data = await res.json();
      if (data.success) {
        setName(data.helper.name || "");
        setServices(data.helper.services || "");
        setPrice(data.helper.price || "");
        setBio(data.helper.bio || "");
        setLocation(data.helper.location || "");
        setAvailableDays(data.helper.availableDays || []);
      }
    };

    loadProfile();
  }, [email, navigate]);

  // TOGGLE AVAILABILITY
  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async () => {
    const res = await fetch("http://localhost:5000/helpers/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        services,
        price,
        bio,
        location,
        availableDays
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Profile saved!");
      navigate("/helper/dashboard");
    } else {
      alert("Error saving profile.");
    }
  };

  // AVAILABILITY BUTTONS (Mon-Sun)
  const daysOfWeek = [
    "2025-05-01",
    "2025-05-02",
    "2025-05-03",
    "2025-05-04",
    "2025-05-05",
    "2025-05-06",
    "2025-05-07"
  ];

  return (
    <div style={styles.page}>
      <h2>Complete Your Helper Profile</h2>
      <p>Email: <strong>{email}</strong></p>

      <label>Services Offered:</label>
      <input
        type="text"
        value={services}
        onChange={(e) => setServices(e.target.value)}
        placeholder="e.g. Lawn Mowing, Cleaning, etc."
        style={styles.input}
      />

      <label>Price per hour ($):</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={styles.input}
      />

      <label>Your Location:</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={styles.input}
        placeholder="City or neighborhood"
      />

      <label>Short Bio:</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={styles.textarea}
      />

      <label>Availability (toggle days):</label>
      <div style={styles.dayRow}>
        {daysOfWeek.map(day => (
          <button
            key={day}
            style={{
              ...styles.dayButton,
              background: availableDays.includes(day) ? "#0055aa" : "#e0e0e0",
              color: availableDays.includes(day) ? "white" : "black"
            }}
            onClick={() => toggleDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <button onClick={handleSave} style={styles.saveBtn}>
        Save Profile
      </button>
    </div>
  );
};

export default HelperProfileSetup;

const styles = {
  page: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 20,
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 15
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    height: 100,
    marginBottom: 15
  },
  dayRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: 20
  },
  dayButton: {
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none"
  },
  saveBtn: {
    width: "100%",
    background: "#0055aa",
    color: "white",
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
  }
};
