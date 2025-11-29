// src/pages/HelperDashboard.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HelperDashboard = () => {
  const navigate = useNavigate();

  const helperEmail = localStorage.getItem("helperEmail");
  const helperId = localStorage.getItem("helperId");

  const [helper, setHelper] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // REDIRECT IF NOT LOGGED IN
  // --------------------------------------------------------
  useEffect(() => {
    if (!helperEmail || !helperId) {
      navigate("/helper/login");
    }
  }, [helperEmail, helperId, navigate]);

  // --------------------------------------------------------
  // FETCH HELPER PROFILE
  // --------------------------------------------------------
  const fetchHelper = async () => {
    try {
      const res = await fetch(`${API}/helpers/by-email/${helperEmail}`);
      const data = await res.json();
      setHelper(data || null);
    } catch (err) {
      console.error("Helper fetch error:", err);
    }
  };

  // --------------------------------------------------------
  // FETCH JOBS FOR THIS HELPER
  // --------------------------------------------------------
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/bookings/by-helper/${helperId}`);
      const data = await res.json();

      setJobs(data || []);

      // Calculate earnings (completed jobs only)
      const total = (data || [])
        .filter((j) => j.status === "Completed")
        .reduce((sum, j) => sum + Number(j.price || 0), 0);

      setEarnings(total);
    } catch (err) {
      console.error("Job fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // MARK COMPLETED
  // --------------------------------------------------------
  const markCompleted = async (jobId) => {
    try {
      const res = await fetch(`${API}/bookings/complete/${jobId}`, {
        method: "PUT",
      });
      const data = await res.json();

      if (data.success) {
        fetchJobs(); // Refresh
      }
    } catch (err) {
      console.error("Complete error:", err);
    }
  };

  // --------------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------------
  useEffect(() => {
    fetchHelper();
    fetchJobs();
  }, []);

  // --------------------------------------------------------
  // STATUS COLORS
  // --------------------------------------------------------
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { background: "#d4ffd6", color: "#006600" };
      case "Cancelled":
        return { background: "#ffe0e0", color: "#990000" };
      default:
      case "Pending":
        return { background: "#fff8d1", color: "#8a6d00" };
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading dashboard…</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HELPER HEADER */}
        <div style={styles.helperHeader}>
          <h2 style={styles.title}>Helper Dashboard</h2>
          {helper && (
            <p style={{ marginTop: -8, color: "#003366" }}>
              Logged in as: <strong>{helper.name}</strong> ({helper.email})
            </p>
          )}
        </div>

        {/* EARNINGS BLOCK */}
        <div style={styles.earningsBox}>
          <h3 style={styles.earningsTitle}>Total Earnings</h3>
          <div style={styles.earningsAmount}>${earnings}</div>
        </div>

        {/* JOBS LIST */}
        <h3 style={styles.sectionTitle}>Your Jobs</h3>

        {jobs.length === 0 && (
          <p>You have no jobs yet.</p>
        )}

        {jobs.map((j) => (
          <div key={j._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.jobService}>{j.service}</h4>
              <span style={{ ...styles.statusTag, ...getStatusColor(j.status) }}>
                {j.status}
              </span>
            </div>

            <p style={styles.field}><strong>Customer:</strong> {j.customerName}</p>
            <p style={styles.field}><strong>Email:</strong> {j.customerEmail}</p>
            <p style={styles.field}><strong>Date:</strong> {j.date}</p>
            <p style={styles.field}>
              <strong>Times:</strong>{" "}
              {Array.isArray(j.timeSlots) ? j.timeSlots.join(", ") : "N/A"}
            </p>
            <p style={styles.field}><strong>Price:</strong> ${j.price}</p>
            <p style={styles.field}><strong>Notes:</strong> {j.notes || "—"}</p>

            {j.status === "Pending" && (
              <button
                style={styles.completeButton}
                onClick={() => markCompleted(j._id)}
              >
                Mark Completed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelperDashboard;

// ====================================================
//                      STYLES
// ====================================================

const styles = {
  page: {
    background: "#f3f6fb",
    minHeight: "100vh",
    paddingTop: "30px",
    paddingBottom: "40px",
  },
  container: {
    width: "90%",
    maxWidth: "900px",
    margin: "0 auto",
  },
  helperHeader: {
    marginBottom: "20px",
  },
  title: {
    color: "#003366",
    fontSize: "28px",
    marginBottom: "6px",
    borderBottom: "2px solid #c7d4e6",
    paddingBottom: "6px",
  },
  earningsBox: {
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #d2dceb",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  earningsTitle: {
    marginTop: 0,
    color: "#003366",
  },
  earningsAmount: {
    fontSize: "28px",
    marginTop: "6px",
    fontWeight: "bold",
    color: "#0078ff",
  },
  sectionTitle: {
    marginTop: "10px",
    color: "#003366",
    marginBottom: "12px",
  },
  card: {
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #d2dceb",
    marginBottom: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  jobService: {
    margin: 0,
    fontSize: "20px",
    color: "#003366",
  },
  statusTag: {
    padding: "4px 10px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  field: {
    marginTop: "6px",
    fontSize: "15px",
  },
  completeButton: {
    marginTop: "12px",
    padding: "10px 14px",
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
