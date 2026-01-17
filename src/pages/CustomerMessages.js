import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getMessages, saveMessages } from "../utils/messageStore";

function CustomerMessages() {
  const location = useLocation();

  const [threads, setThreads] = useState(() => getMessages() || {});
  const [activeHelper, setActiveHelper] = useState(() => Object.keys(getMessages() || {})[0] || "");
  const [newMessage, setNewMessage] = useState("");

  const activeHelperName = useMemo(() => {
    // If we arrived from HomePage, show the nicer display name if provided
    if (location.state?.selectedHelperName && location.state?.selectedHelper) {
      if (activeHelper === location.state.selectedHelper) return location.state.selectedHelperName;
    }
    return activeHelper || "Helper";
  }, [activeHelper, location.state]);

  // If user navigates here via Contact button, select/create thread
  useEffect(() => {
    const selected = location.state?.selectedHelper;
    if (!selected) return;

    setThreads((prev) => {
      const next = { ...(prev || {}) };
      if (!next[selected]) next[selected] = [];
      saveMessages(next);
      return next;
    });

    setActiveHelper(selected);
  }, [location.state]);

  function sendMessage() {
    if (!newMessage.trim() || !activeHelper) return;

    const updated = {
      ...(threads || {}),
      [activeHelper]: [
        ...((threads && threads[activeHelper]) || []),
        { sender: "you", text: newMessage.trim() },
      ],
    };

    setThreads(updated);
    saveMessages(updated);

    // increment notification counter
    const current = Number(localStorage.getItem("tfh_notify") || 0);
    localStorage.setItem("tfh_notify", current + 1);

    setNewMessage("");
  }

  // reset notification when opening messages
  useEffect(() => {
    localStorage.setItem("tfh_notify", 0);
  }, []);

  const helperKeys = Object.keys(threads || {});
  const conversation = (threads && threads[activeHelper]) || [];

  return (
    <DashboardLayout>
      <h1>Messages</h1>

      <div style={{ display: "flex", marginTop: 20, maxWidth: 900 }}>
        <div style={{ width: 220, borderRight: "1px solid #ccc" }}>
          {helperKeys.length === 0 && (
            <div style={{ padding: 10, color: "#555" }}>No conversations yet.</div>
          )}

          {helperKeys.map((helperKey) => (
            <div
              key={helperKey}
              onClick={() => setActiveHelper(helperKey)}
              style={{
                padding: 10,
                cursor: "pointer",
                background: activeHelper === helperKey ? "#003f63" : "transparent",
                color: activeHelper === helperKey ? "white" : "black",
                borderRadius: 5,
                marginBottom: 5,
                wordBreak: "break-word",
              }}
            >
              {helperKey}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, paddingLeft: 20 }}>
          <h3 style={{ marginTop: 0 }}>
            Conversation with {activeHelperName}
          </h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: 15,
              minHeight: 260,
              marginBottom: 10,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            {conversation.length === 0 ? (
              <p style={{ color: "#666" }}>No messages yet. Say hello 👋</p>
            ) : (
              conversation.map((msg, index) => (
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
              style={{ flex: 1, padding: 8 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              disabled={!activeHelper}
            />
            <button onClick={sendMessage} style={sendBtn} disabled={!activeHelper}>
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const sendBtn = {
  marginLeft: 10,
  padding: "8px 16px",
  background: "#003f63",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 800,
};

export default CustomerMessages;
