import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HelperPostAvailability = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const id = new URLSearchParams(location.search).get("id");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const postAvailability = async () => {
    const res = await fetch("http://localhost:5000/helpers/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helperId: id,
        date,
        time,
        description,
      }),
    });

    if (res.ok) {
      alert("Availability posted!");
      navigate("/calendar?role=helper&id=" + id);
    } else {
      alert("Error posting availability");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Post Your Availability</h2>

      <input
        type="date"
        style={styles.input}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="time"
        style={styles.input}
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <textarea
        placeholder="Description (optional)"
        style={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <button style={styles.button} onClick={postAvailability}>
        Post Availability
      </button>
    </div>
  );
};

export default HelperPostAvailability;

const styles = {
  container: { padding: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #aaa",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    minHeight: "90px",
    borderRadius: "6px",
    border: "1px solid #aaa",
    marginBottom: "12px",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    background: "#00aa55",
    color: "white",
    border: "none",
  },
};
