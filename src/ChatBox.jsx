import { useState, useEffect, useRef } from "react";
import { db } from "./firebaseConfig"; // dein vorhandenes Firebase
import { ref, push, onValue } from "firebase/database";

const ChatBox = ({ roomCode, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomCode) {
      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMessages(Object.values(data));
        }
      });
    }
  }, [roomCode]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "" || !playerName) return;

    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    await push(chatRef, {
      sender: playerName,
      text: input.trim(),
      timestamp: Date.now()
    });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && playerName) {
      sendMessage();
    }
  };

  if (!roomCode) {
    return null; // Chat nicht anzeigen, wenn man nicht im Raum ist
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 100
    }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: "#39c2ff",
            border: "none",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "30px",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            animation: "pulse 2s infinite"
          }}
        >
          💬
        </button>
      ) : (
        <div style={{
          width: "300px",
          height: "400px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "16px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.7)",
          color: "white",
          fontSize: "14px",
          transform: "scale(0.9)",
          animation: "pop 0.3s forwards"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px"
          }}>
            <strong>Chat</strong>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              ✖️
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "5px",
            marginBottom: "10px"
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#39c2ff" }}>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!playerName} // <-- Eingabe gesperrt ohne Name
            placeholder={playerName ? "Nachricht eingeben..." : "Bitte erst beitreten..."}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "10px",
              width: "100%",
              fontSize: "14px",
              backgroundColor: playerName ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
              color: "white",
              outline: "none",
              cursor: playerName ? "text" : "not-allowed"
            }}
          />
        </div>
      )}

      {/* Animationen */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          @keyframes pop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ChatBox;
