import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  const [messages, setMessages] = useState([
    { sender: "Helper", text: "Hi! I'm available for your job tomorrow." },
    { sender: "You", text: "Perfect, thank you!" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setMessages([...messages, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <DashboardLayout>
      <h1>Messages</h1>
      <p>Your conversations with helpers appear below.</p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          maxWidth: "600px",
          marginBottom: "15px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "400px", padding: "8px" }}
      />

      <button
        onClick={sendMessage}
        style={{
          marginLeft: "10px",
          padding: "8px 16px",
          background: "#003f63",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Send
      </button>
    </DashboardLayout>
  );
}

export default CustomerMessages;
