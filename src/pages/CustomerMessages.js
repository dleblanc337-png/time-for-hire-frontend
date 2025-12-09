import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  const [messages, setMessages] = useState([
    { sender: "Helper", text: "Hi! I’m available for your job tomorrow." },
    { sender: "You", text: "Perfect, thank you!" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  function sendMessage() {
    if (!newMessage.trim()) return;

    setMessages([...messages, { sender: "You", text: newMessage }]);
    setNewMessage("");
  }

  return (
    <DashboardLayout>
      <h1>Messages</h1>
      <p>Your conversations with helpers will appear here.</p>

      {/* Message Thread */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          maxWidth: "600px",
          marginTop: "20px",
          marginBottom: "12px",
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "8px",
              textAlign: msg.sender === "You" ? "right" : "left",
            }}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div style={{ maxWidth: "600px", display: "flex", gap: "8px" }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "8px 14px",
            background: "#0a3c6e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </DashboardLayout>
  );
}

export default CustomerMessages;
