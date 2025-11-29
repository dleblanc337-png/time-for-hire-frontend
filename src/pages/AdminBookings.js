import React, { useEffect, useState } from "react";
import axios from "axios";

// ⭐ Status label styling
function statusStyle(status) {
  const colors = {
    Pending: { background: "yellow", color: "black" },
    Completed: { background: "lightgreen", color: "black" },
    Paid: { background: "lightblue", color: "black" },
  };

  return {
    padding: "4px 10px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
    display: "inline-block",
    ...colors[status],
  };
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  // Load all bookings
  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // Delete booking
  async function handleDelete(id) {
    if (!window.confirm("Delete this booking?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setBookings(bookings.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting booking.");
    }
  }

  // Update status (Pending → Completed → Paid)
  async function handleStatusChange(id, newStatus) {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status: newStatus }
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
    } catch (err) {
      console.error(err);
      alert("Could not update status.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Bookings Dashboard</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Service</th>
              <th>Status</th>
              <th>Change Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{b.date}</td>
                <td>{b.time}</td>
                <td>{b.service}</td>

                {/* Status label */}
                <td>
                  <span style={statusStyle(b.status)}>{b.status}</span>
                </td>

                {/* Dropdown to update status */}
                <td>
                  <select
                    value={b.status}
                    onChange={(e) =>
                      handleStatusChange(b._id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Paid">Paid</option>
                  </select>
                </td>

                <td>
                  <button onClick={() => handleDelete(b._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
