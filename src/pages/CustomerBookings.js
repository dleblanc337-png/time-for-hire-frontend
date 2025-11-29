import React, { useState } from "react";
import axios from "axios";

export default function CustomerBookings() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `/api/bookings/customer/email/${encodeURIComponent(email)}`
      );
      setBookings(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Could not load your bookings.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Bookings</h1>
      <p>Enter the email you used when booking to see your appointments.</p>

      <div style={{ marginTop: "10px", marginBottom: "20px" }}>
        <input
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", width: "280px", marginRight: "10px" }}
        />
        <button
          onClick={loadBookings}
          style={{
            padding: "8px 16px",
            background: "#00335a",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Load my bookings
        </button>
      </div>

      {loading && <p>Loading your bookings...</p>}

      {!loading && bookings.length === 0 && (
        <p>No bookings found for this email.</p>
      )}

      {!loading && bookings.length > 0 && (
        <table
          style={{
            borderCollapse: "collapse",
            minWidth: "600px",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Service</th>
              <th style={thStyle}>Helper</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td style={tdStyle}>{b.date}</td>
                <td style={tdStyle}>{b.time}</td>
                <td style={tdStyle}>{b.service}</td>
                <td style={tdStyle}>{b.helperId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f0f0f0",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
