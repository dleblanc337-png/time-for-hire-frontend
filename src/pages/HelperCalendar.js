import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function HelperCalendar() {
  const { helperId } = useParams();
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!helperId) return;

    // Load availability
    axios
      .get(`/api/availability/helper/${helperId}`)
      .then((res) => setAvailability(res.data))
      .catch((err) => console.error(err));

    // Load bookings
    axios
      .get(`/api/bookings/helper/${helperId}`)
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err));
  }, [helperId]);

  // Convert DB format to quick lookup
  const availMap = {};
  const bookMap = {};

  availability.forEach((a) => {
    availMap[a.date] = a.slots || [];
  });

  bookings.forEach((b) => {
    if (!bookMap[b.date]) bookMap[b.date] = [];
    bookMap[b.date].push(b.time);
  });

  // Generate next 7 days for display
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    days.push(iso);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Helper Weekly Calendar</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        {days.map((day) => (
          <div
            key={day}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
              width: "140px",
              background: "#f8f8f8",
            }}
          >
            <h4>{day}</h4>

            {/* Availability slots */}
            {(availMap[day] || []).length === 0 && (
              <p style={{ fontSize: "14px", color: "#888" }}>No availability</p>
            )}

            {(availMap[day] || []).map((slot, i) => {
              const start = slot.split("-")[0];
              const isBooked =
                bookMap[day] && bookMap[day].includes(start);

              return (
                <div
                  key={i}
                  style={{
                    padding: "4px",
                    marginBottom: "4px",
                    borderRadius: "4px",
                    background: isBooked ? "#ffb3b3" : "#b3ffb3",
                    border: "1px solid #888",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {slot} {isBooked && "(BOOKED)"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
