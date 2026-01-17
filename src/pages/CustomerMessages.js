import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getMessages, saveMessages } from "../utils/messageStore";

function CustomerMessages() {
  const location = useLocation();
  const [threads, setThreads] = useState(getMessages());

  // Pick first thread safely (or null)
  const firstKey = Object.keys(getMessages() || {})[0] || null;
  const [activeHelper, setActiveHelper] = useState(firstKey);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Open from HomePage click (navigate state)
  useEffect(() => {
    if (location.state?.selectedHelper) {
      setActiveHelper(location.state.selectedHelper);
    }
  }, [location.state]);

  // ✅ Fallback: if user refreshes /messages, we still open the intended helper
  useEffect(() => {
    if (location.state?.selectedHelper) return;

    const saved = localStorage.getItem("tfh_start_chat");
    if (saved) {
      setActiveHelper(saved);
      localStorage.removeItem("tfh_start_chat");
    }
  }, [location.state]);

  // ✅ Ensure thread array exists before rendering/sending
  useEffect(() => {
    if (!activeHelper) return;

    if (!threads[activeHelper]) {
      const updated = { ...threads, [activeHelper]: [] };
      setThreads(updated);
      saveMessages(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHelper]);

  function sendMessage() {
    if (!activeHelper) return;
    if (!newMessage.trim()) return;

    const updated = {
      ...threads,
      [activeHelper]: [
        ...(threads[activeHelper] || []),
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

  const helperList = Object.keys(threads || {});
  const safeActive = activeHelper || helperList[0] || "No conversations yet";
  const activeMsgs = threads?.[safeActive] || [];

  return (
    <DashboardLayout>
      <h1>Messages</h1>

      <div style={{ display: "flex", marginTop: "20px", maxWidth: "900px" }}>
        <div style={{ width: "220px", borderRight: "1px solid #ccc" }}>
          {helperList.length === 0 && (
            <div style={{ padding: "10px", color: "#666" }}>
              No conversations yet.
            </div>
          )}

          {helperList.map((helper) => (
            <div
              key={helper}
              onClick={() => setActiveHelper(helper)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: safeActive === helper ? "#003f63" : "transparent",
                color: safeActive === helper ? "white" : "black",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              {helper}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <h3>Conversation with {safeActive}</h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              minHeight: "260px",
              marginBottom: "10px",
            }}
          >
            {activeMsgs.length === 0 ? (
              <p style={{ color: "#666" }}>No messages yet. Say hello 👋</p>
            ) : (
              activeMsgs.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender === "you" ? "You" : "Helper"}:</strong>{" "}
                  {msg.text}
                </p>
              ))
            )}
          </div>

          <div style={{ display: "flex" }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "8px" }}
              disabled={!activeHelper && helperList.length === 0}
            />
            <button onClick={sendMessage} style={sendBtn} disabled={!activeHelper && helperList.length === 0}>
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
  cursor: "pointer",
};

export default CustomerMessages;
