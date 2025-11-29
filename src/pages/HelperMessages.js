import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function HelperMessages() {
  const [searchParams] = useSearchParams();
  const helperId = searchParams.get("helperId");

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!helperId) return;

    const loadBookings = async () => {
      try {
        const res = await axios.get(`/api/bookings/helper/${helperId}`);
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadBookings();
  }, [helperId]);

  const selectBooking = async (booking) => {
    setSelectedBooking(booking);
    setNewMessage("");
    try {
      const res = await axios.get(`/api/messages/booking/${booking._id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!selectedBooking || !newMessage.trim()) return;

    try {
      const body = {
        bookingId: selectedBooking._id,
        helperId,
        customerEmail: selectedBooking.email,
        sender: "helper",
        text: newMessage,
      };

      const res = await axios.post("/api/messages", body);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert("Could not send message.");
    }
  };

  if (!helperId) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Helper Messages</h1>
        <p>No helperId provided. Use: /helper/messages?helperId=YOUR_ID</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Helper Messages</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Bookings</h2>
          {bookings.length === 0 && <p>No bookings yet.</p>}
          {bookings.map((b) => (
            <div
              key={b._id}
              style={{
                border: "1px solid #ccc",
                padding: 8,
                marginBottom: 8,
                cursor: "pointer",
                background:
                  selectedBooking && selectedBooking._id === b._id
                    ? "#eef"
                    : "white",
              }}
              onClick={() => selectBooking(b)}
            >
              {b.name} — {b.service} — {b.date} {b.time}
            </div>
          ))}
        </div>

        {selectedBooking && (
          <div style={{ flex: 1 }}>
            <h2>Conversation</h2>
            <div
              style={{
                border: "1px solid #ccc",
                padding: 8,
                height: 220,
                overflowY: "auto",
                marginBottom: 10,
              }}
            >
              {messages.length === 0 && <p>No messages yet.</p>}
              {messages.map((m) => (
                <div key={m._id} style={{ marginBottom: 6 }}>
                  <strong>{m.sender === "helper" ? "You" : "Customer"}:</strong>{" "}
                  {m.text}
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ width: "100%", marginBottom: 6 }}
              placeholder="Reply to customer..."
            />
            <button onClick={sendMessage} style={{ padding: "6px 12px" }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
