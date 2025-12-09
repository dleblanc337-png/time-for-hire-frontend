export function getMessages() {
  const data = localStorage.getItem("tfh_messages");
  return data
    ? JSON.parse(data)
    : {
        "Sarah M.": [
          { sender: "helper", text: "Hello, I can help with your request." },
        ],
        "Mike R.": [
          { sender: "helper", text: "Your booking is confirmed." },
        ],
      };
}

export function saveMessages(messages) {
  localStorage.setItem("tfh_messages", JSON.stringify(messages));
}
