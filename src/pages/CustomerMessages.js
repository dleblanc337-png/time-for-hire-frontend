import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  // Core conversation store (threadId -> messages)
  const [threads, setThreads] = useState({
    thread1: [
      { sender: "helper", text: "Hello, I can help with your request." },
    ],
    thread2: [
      { sender: "helper", text: "Your booking is confirmed." },
    ],
  });

  // Simple thread labels (can later come from backend)
  const [threadNames] = useState({
    thread1: "Conversation 1",
    thread2: "Conversation 2",
  });

  const [activeThread, setActiveThread] = useState("thread1");
  const [newMessage, setNewMessage] = useState("");

  function sendMessage() {
    if (!newMessage.trim()) return;

    setThreads((prev) => ({
      ...prev,
      [activeThread]: [
        ...prev[activeThread],
        { sender: "you", text: newMessage },
      ],
    }));

    setNewMessage("");
  }

  return (
    <DashboardLayout>
      <h1>Messages</h1>

      <div style={{ display: "flex", marginTop: "20px", maxWidth: "900px" }}>
        {/* LEFT: THREAD LIST */}
        <div
          style={{
            width: "220px",
            borderRight: "1px solid #ccc",
            paddingRight: "10px",
          }}
        >
          {Object.keys(threads).map((threadId) => (
            <div
              key={threadId}
              onClick={() => setActiveThread(threadId)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background:
                  activeThread === threadId ? "#003f63" : "transparent",
                color: activeThread === threadId ? "white" : "black",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              {threadNames[threadId]}
            </div>
          ))}
        </div>

        {/* RIGHT: ACTIVE THREAD */}
        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              minHeight: "260px",
              marginBottom: "10px",
            }}
          >
            {threads[activeThread].map((msg, index) => (
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
