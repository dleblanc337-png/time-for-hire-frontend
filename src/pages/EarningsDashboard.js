import React, { useEffect, useState } from "react";

const EarningsDashboard = ({ helperId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // Fetch earnings summary
  // ======================================================
  const fetchEarnings = async () => {
    try {
      const res = await fetch(`http://localhost:5000/earnings/${helperId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEarnings();
  }, [helperId]);

  if (loading) return <div>Loading earnings...</div>;
  if (!data || !data.success)
    return <div>Error loading earnings. Try again later.</div>;

  return (
    <div style={styles.container}>
      <h2>Your Earnings Dashboard</h2>

      <div style={styles.summaryBox}>
        <h3>Total Earned: ${data.totalEarnings}</h3>
        <h4>Completed Jobs: {data.completedJobs}</h4>
      </div>

      <h3>Completed Bookings</h3>

      {data.bookings.length === 0 && (
        <p>You have no completed jobs yet.</p>
      )}

      {data.bookings.map((b) => (
        <div key={b._id} style={styles.card}>
          <h3>{b.service}</h3>
          <p>
            <strong>Date:</strong> {b.date} at {b.time}
          </p>
          <p>
            <strong>Customer:</strong> {b.name}
          </p>
          <p>
            <strong>Price Earned:</strong> ${b.helperPrice}
          </p>
          <p>
            <strong>Completed On:</strong>{" "}
            {new Date(b.completedAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EarningsDashboard;

// ======================================================
// Styles
// ======================================================
const styles = {
  container: {
    padding: "20px",
  },
  summaryBox: {
    padding: "10px",
    background: "#e9f3ff",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
    background: "#f9f9f9",
  },
};
