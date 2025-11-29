import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicBookingForm() {
  const { id } = useParams(); // helperId
  const [helper, setHelper] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    date: "",
    time: "",
    notes: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);

  // Load helper info
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/helpers");
        const found = res.data.find((h) => h._id === id);
        setHelper(found);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  // Load available 1h slots whenever date changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!form.date) {
        setAvailableSlots([]);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/availability/${id}/${form.date}`
        );
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error("Error loading availability:", err);
        setAvailableSlots([]);
      }
    };

    loadSlots();
  }, [form.date, id]);

  const submitBooking = async () => {
    if (!form.customerName || !form.customerEmail || !form.date || !form.time) {
      alert("Please fill name, email, date and time.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/bookings", {
        name: form.customerName,
        email: form.customerEmail,
        date: form.date,
        time: form.time,
        service: helper?.serviceName || "Service",
        notes: form.notes,
        helperId: id,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
      });

      alert("Booking request sent!");

      setForm({
        customerName: "",
        customerEmail: "",
        date: "",
        time: "",
        notes: "",
      });
      setAvailableSlots([]);
    } catch (e) {
      console.error(e);
      alert("Could not submit booking");
    }
  };

  if (!helper) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Book {helper.name}</h1>
      <p>
        Service:{" "}
        <strong>{helper.serviceName || "Service not specified yet"}</strong>
      </p>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Your Name"
          value={form.customerName}
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
          style={{ width: "300px", marginBottom: "10px", padding: "8px" }}
        />
        <br />

        <input
          type="email"
          placeholder="Your Email"
          value={form.customerEmail}
          onChange={(e) =>
            setForm({ ...form, customerEmail: e.target.value })
          }
          style={{ width: "300px", marginBottom: "10px", padding: "8px" }}
        />
        <br />

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={{ width: "300px", marginBottom: "10px", padding: "8px" }}
        />
        <br />

        {/* Time from availability */}
        <select
  value={form.time}
  onChange={(e) => setForm({ ...form, time: e.target.value })}
  style={{ width: "300px", marginBottom: "10px", padding: "8px" }}
  disabled={!form.date || availableSlots.length === 0}
>
  <option value="">
    {form.date
      ? availableSlots.length === 0
        ? "No available times for this date"
        : "Select a time"
      : "Select a date first"}
  </option>

  {availableSlots.map((slot, idx) => {
    const [start, end] = slot.split("-");
    return (
      <option key={idx} value={start}>
        {start} – {end}
      </option>
    );
  })}
</select>

        <br />

        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ width: "300px", height: "100px", padding: "8px" }}
        />
        <br />

        <button
          onClick={submitBooking}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "green",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Submit Booking
        </button>
      </div>
    </div>
  );
}
