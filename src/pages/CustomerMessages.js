import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  const location = useLocation();

  // Core thread store by helper name
  const [threads, setThreads] = useState({
    "Sarah M.": [{ sender: "helper", text: "Hello, I can help with your request." }],
    "Mike R.": [{ sender: "helper", text: "Your booking is confirmed." }],
  });

  const [activeHelper, setActiveHelper] = useState("Sarah M.");
  const [newMessage, setNewMessage] = useState("");

  // ✅ AUTO-OPEN CORRECT HELPER FROM BOOKINGS
  useEffect(() => {
    if (location.state?.selectedHelper) {
      setActiveHelper(location.state.selectedHelper);
    }
  }, [location.state]);

  function sendMessage() {
    if (!newMessage.trim()) return;

    setThreads((prev) => ({
      ...prev,
      [activeHelper]: [
        ...prev[activeHelper],
        { sender: "you", text: newMessage },
      ],
    }));

    setNewMessage("");
  }

  return (
    <DashboardLayout>
      <h1>Messages</h1>

      <div style={{ display: "flex", marginTop: "20px", maxWidth: "900px" }}>
        {/* LEFT: HELPER LIST */}
        <div
          style={{
            width: "220px",
            borderRight: "1px solid #ccc",
            paddingRight: "10px",
          }}
        >
          {Object.keys(threads).map((helper) => (
            <div
              key={helper}
              onClick={() => setActiveHelper(helper)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background:
                  activeHelper === helper ? "#003f63" : "transparent",
                color: activeHelper === helper ? "white" : "black",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              {helper}
            </div>
          ))}
        </div>

        {/* RIGHT: ACTIVE CHAT */}
        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <h3>Conversation with {activeHelper}</h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              minHeight: "260px",
              marginBottom: "10px",
            }}
          >
            {threads[activeHelper].map((msg, index) => (
              <p key={index}>
                <strong>{msg.sender === "you" ? "You" : "Helper"}:</strong>{" "}
                {msg.text}
              </p>
            ))}
          </div>

          {/* INPUT */}
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
              }}
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
