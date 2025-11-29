import React, { useEffect, useState } from "react";

const HelperJobs = ({ helperId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // Fetch helper bookings
  // ======================================================
  const fetchBookings = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/bookings/helper/${helperId}`
      );
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching helper bookings:", err);
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [helperId]);

  // ======================================================
  // Mark a job completed
  // ======================================================
  const markCompleted = async (id) => {
    try {
      await fetch(`http://localhost:5000/bookings/${id}/complete`, {
        method: "PUT",
      });
      fetchBookings(); // 🔄 refresh list
    } catch (err) {
      console.error("Error completing booking:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2>Your Jobs</h2>

      {bookings.length === 0 && <p>No bookings assigned to you.</p>}

      {bookings.map((b) => (
        <div key={b._id} style={styles.card}>
          <h3>{b.service}</h3>

          <p>
            <strong>Customer:</strong> {b.name}
          </p>

          <p>
            <strong>Date:</strong> {b.date} at {b.time}
          </p>

          <p>
            <strong>Notes:</strong> {b.notes || "None"}
          </p>

          <p>
            <strong>Price:</strong> ${b.helperPrice}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  b.status === "Completed"
                    ? "green"
                    : b.status === "Paid"
                    ? "blue"
                    : "orange",
              }}
            >
              {b.status}
            </span>
          </p>

          {/* Button only appears if job is NOT completed */}
          {b.status !== "Completed" && b.status !== "Paid" && (
            <button
              onClick={() => markCompleted(b._id)}
              style={styles.button}
            >
              Mark Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default HelperJobs;

// ======================================================
// Styles
// ======================================================
const styles = {
  container: {
    padding: "20px",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
    background: "#f9f9f9",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    background: "#0066cc",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
