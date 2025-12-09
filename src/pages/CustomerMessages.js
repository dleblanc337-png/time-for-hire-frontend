import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerMessages() {
  const conversations = [
    {
      id: 1,
      name: "Sarah M.",
      lastMessage: "I’ll be there at 9am tomorrow 👍",
    },
    {
      id: 2,
      name: "Mike R.",
      lastMessage: "Job completed — thanks again!",
    },
  ];

  return (
    <DashboardLayout>
      <h1>Messages</h1>
      <p>Your conversations with helpers appear here.</p>

      <div style={{ marginTop: "20px", maxWidth: "600px" }}>
        {conversations.map((chat) => (
          <div
            key={chat.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
              background: "#f9f9f9",
            }}
          >
            <h4 style={{ margin: "0 0 6px 0" }}>{chat.name}</h4>
            <p style={{ margin: 0, color: "#555" }}>{chat.lastMessage}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default CustomerMessages;
