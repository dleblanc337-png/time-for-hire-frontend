import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getMessages, saveMessages } from "../utils/messageStore";

function CustomerMessages() {
  const location = useLocation();
  const [threads, setThreads] = useState(getMessages());
  const [activeHelper, setActiveHelper] = useState(Object.keys(threads)[0]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (location.state?.selectedHelper) {
      setActiveHelper(location.state.selectedHelper);
    }
  }, [location.state]);
useEffect(() => {
  if (location.state?.selectedHelper) return;

  const saved = localStorage.getItem("tfh_start_chat");
  if (saved) {
    setActiveHelper(saved);
    localStorage.removeItem("tfh_start_chat");
  }
}, [location.state]);

  function sendMessage() {
    if (!newMessage.trim()) return;

    const updated = {
      ...threads,
      [activeHelper]: [
        ...threads[activeHelper],
        { sender: "you", text: newMessage },
      ],
    };

    setThreads(updated);
    saveMessages(updated);

    // ✅ increment notification counter
    const current = Number(localStorage.getItem("tfh_notify") || 0);
    localStorage.setItem("tfh_notify", current + 1);

    setNewMessage("");
  }

  // ✅ reset notification when opening messages
  useEffect(() => {
    localStorage.setItem("tfh_notify", 0);
  }, []);

  return (
    <DashboardLayout>
      <h1>Messages</h1>

      <div style={{ display: "flex", marginTop: "20px", maxWidth: "900px" }}>
        <div style={{ width: "220px", borderRight: "1px solid #ccc" }}>
          {Object.keys(threads).map((helper) => (
            <div
              key={helper}
              onClick={() => setActiveHelper(helper)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: activeHelper === helper ? "#003f63" : "transparent",
                color: activeHelper === helper ? "white" : "black",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              {helper}
            </div>
          ))}
        </div>

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

          <div style={{ display: "flex" }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "8px" }}
            />
            <button onClick={sendMessage} style={sendBtn}>
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const sendBtn = {
  marginLeft: "10px",
  padding: "8px 16px",
  background: "#003f63",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

export default CustomerMessages;
