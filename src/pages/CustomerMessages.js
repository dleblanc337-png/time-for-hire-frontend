import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  const [selectedHelper, setSelectedHelper] = useState("Sarah M.");

  const helpers = ["Sarah M.", "Mike R.", "David P."];

  const mockMessages = {
    "Sarah M.": [
      { from: "helper", text: "Hi! I'm available for your job tomorrow." },
      { from: "you", text: "Perfect, thank you!" },
    ],
    "Mike R.": [
      { from: "helper", text: "I will arrive at 3pm for yard work." },
      { from: "you", text: "Sounds good!" },
    ],
    "David P.": [
      { from: "helper", text: "Let me know if you need help this weekend." },
    ],
  };

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    mockMessages[selectedHelper].push({ from: "you", text: input });
    setInput("");
  };

  return (
    <DashboardLayout>
      <h1>Messages</h1>
      <p>Your conversations with helpers appear below.</p>

      <div style={{ display: "flex", maxWidth: "900px" }}>
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: "200px",
            background: "#f5f5f5",
            borderRight: "1px solid #ddd",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Helpers</h3>
          {helpers.map((h) => (
            <div
              key={h}
              onClick={() => setSelectedHelper(h)}
              style={{
                padding: "8px",
                marginBottom: "8px",
                background: selectedHelper === h ? "#003f63" : "#fff",
                color: selectedHelper === h ? "white" : "black",
                borderRadius: "5px",
                cursor: "pointer",
                border: "1px solid #ccc",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* CHAT WINDOW */}
        <div style={{ flex: 1, padding: "20px" }}>
          <h2>Conversation with {selectedHelper}</h2>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              minHeight: "200px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {mockMessages[selectedHelper].map((msg, i) => (
              <p key={i}>
                <strong>{msg.from === "you" ? "You" : "Helper"}:</strong>{" "}
                {msg.text}
              </p>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ marginTop: "10px", display: "flex" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "10px",
                padding: "8px 14px",
                background: "#003f63",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CustomerMessages;
