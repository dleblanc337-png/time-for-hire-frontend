import React, { useState } from "react";
import { getMessages, saveMessages } from "../utils/messageStore";

function HelperMessages() {
  const [threads, setThreads] = useState(getMessages());
  const [activeCustomer, setActiveCustomer] = useState(Object.keys(threads)[0]);
  const [newMessage, setNewMessage] = useState("");

  function sendMessage() {
    if (!newMessage.trim()) return;

    const updated = {
      ...threads,
      [activeCustomer]: [
        ...threads[activeCustomer],
        { sender: "helper", text: newMessage },
      ],
    };

    setThreads(updated);
    saveMessages(updated);

    // ✅ notify customer
    const current = Number(localStorage.getItem("tfh_notify") || 0);
    localStorage.setItem("tfh_notify", current + 1);

    setNewMessage("");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Helper Inbox</h1>

      <div style={{ display: "flex", marginTop: "20px" }}>
        <div style={{ width: "220px", borderRight: "1px solid #ccc" }}>
          {Object.keys(threads).map((name) => (
            <div
              key={name}
              onClick={() => setActiveCustomer(name)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: activeCustomer === name ? "#003f63" : "transparent",
                color: activeCustomer === name ? "white" : "black",
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <h3>Chat with {activeCustomer}</h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              minHeight: "260px",
              marginBottom: "10px",
            }}
          >
            {threads[activeCustomer].map((msg, i) => (
              <p key={i}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ padding: "8px", width: "300px" }}
          />

          <button onClick={sendMessage} style={helperBtn}>
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

const helperBtn = {
  marginLeft: "10px",
  padding: "8px 16px",
  background: "#003f63",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

export default HelperMessages;
