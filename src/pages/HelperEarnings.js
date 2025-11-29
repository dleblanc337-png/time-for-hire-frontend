import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function HelperEarnings() {
  // For now, helperId is passed in URL as ?id=HELPER_ID
  const [searchParams] = useSearchParams();
  const helperId = searchParams.get("id");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!helperId) return;

    const load = async () => {
      try {
        const res = await axios.get(`/api/bookings/helper/${helperId}`);
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Could not load earnings.");
      }
      setLoading(false);
    };

    load();
  }, [helperId]);

  if (!helperId) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Helper Earnings</h1>
        <p>No helper selected. Open this page using:</p>
        <code>/helper/earnings?id=HELPER_ID</code>
      </div>
    );
  }

  if (loading) return <p style={{ padding: 20 }}>Loading earnings...</p>;

  // Calculate total earnings
  const total = bookings.reduce((sum, b) => sum + (b.helperPrice || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Earnings</h1>
      <h2 style={{ marginTop: 5, color: "green" }}>
        Total Earned: ${total}
      </h2>

      {bookings.length === 0 && (
        <p style={{ marginTop: 20 }}>No bookings yet.</p>
      )}

      {bookings.length > 0 && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginTop: 20,
            maxWidth: 800,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Service</th>
              <th style={thStyle}>Earnings</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td style={tdStyle}>{b.date}</td>
                <td style={tdStyle}>{b.time}</td>
                <td style={tdStyle}>{b.service}</td>
                <td style={tdStyle}>${b.helperPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc",
};
