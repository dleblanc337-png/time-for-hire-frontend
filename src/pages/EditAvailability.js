import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { suggestServices } from "../data/serviceKeywords";

export default function EditAvailability() {
  const { id } = useParams(); // helperId

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [price, setPrice] = useState("");

  const suggestions = suggestServices(serviceInput);

  const saveWindow = async () => {
    if (!date || !startTime || !endTime || !serviceInput || !price) {
      alert("Please complete all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/availability/setwindow", {
        helperId: id,
        date,
        startTime,
        endTime,
        rawServices: serviceInput,
        pricePerHour: Number(price),
      });

      alert("Availability saved!");
      setServiceInput("");
      setPrice("");
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save availability.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: 520 }}>
      <h1>Edit Availability</h1>

      <label>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Start time</label>
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

      <label>End time</label>
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

      <label>Service</label>
      <input
        type="text"
        placeholder="carpenter, cleaning..."
        value={serviceInput}
        onChange={(e) => setServiceInput(e.target.value)}
      />

      {suggestions.length > 0 && (
        <div style={{ border: "1px solid #ccc", borderRadius: 4 }}>
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => setServiceInput(s)}
              style={{ padding: 6, cursor: "pointer" }}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      <label>Price ($ / hour)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={saveWindow} style={{ marginTop: 12 }}>
        Save Availability
      </button>
    </div>
  );
}
