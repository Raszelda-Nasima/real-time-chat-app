import React, { useEffect, useState } from "react";
import socket from "../socket"; // Import socket instance

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Listen for previous messages when connecting to the socket
    socket.on("previousMessages", (messages) => {
      setMessages(messages); // Display previous messages when new user connects
    });

    // Listen for incoming messages (chatMessage) from the server
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]); // Add new message to state
    });

    // Cleanup on component unmount
    return () => {
      socket.off("previousMessages");
      socket.off("chatMessage");
    };
  }, []);

  // Send message to server
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", message); // Emit chatMessage to backend
      setMessage(""); // Clear input field after sending
    }
  };

  return (
    <div className="container mt-5">
      <h1>Real-Time Chat</h1>
      <div className="border p-3" style={{ height: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index} className="alert alert-secondary">{msg.text}</p> // Display message text
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="form-control"
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary mt-2">Send</button>
      </form>
    </div>
  );
}

export default Chat;



