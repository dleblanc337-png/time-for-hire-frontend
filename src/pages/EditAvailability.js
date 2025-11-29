import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EditAvailability() {
  const { id } = useParams(); // helperId
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const saveWindow = async () => {
    if (!date || !startTime || !endTime) {
      alert("Please select date, start time, and end time.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/availability/setwindow", {
        helperId: id,
        date,
        startTime,
        endTime
      });

      alert("Availability saved!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save availability.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Availability</h1>
      <p>
        Add when you are <strong>free</strong>. The system will automatically
        split your window into 1-hour blocks customers can book.
      </p>

      <div style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Date:</label>
          <br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Start time (when you are free):</label>
          <br />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>End time:</label>
          <br />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <button
          onClick={saveWindow}
          style={{
            padding: "10px 20px",
            background: "purple",
            color: "white",
            borderRadius: "5px",
            border: "none",
          }}
        >
          Save Availability Window
        </button>
      </div>
    </div>
  );
}
