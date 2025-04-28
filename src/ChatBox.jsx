import { useState, useEffect, useRef } from "react";
import { db } from "./firebaseConfig"; // Deine Firebase-Konfiguration
import { ref, push, onValue } from "firebase/database"; // Funktionen von Firebase Realtime Database

const ChatBox = ({ roomCode, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false); // <== NEU: Emojis anzeigen
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

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
      type: "text",
      timestamp: Date.now()
    });

    setInput("");
  };

  const sendSoundMessage = async (soundName) => {
    if (!playerName) return;
    playSound(soundName);

    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    await push(chatRef, {
      sender: playerName,
      type: "sound",
      sound: soundName,
      timestamp: Date.now()
    });
  };

  const playSound = (soundName) => {
    let soundUrl = "";

    if (soundName === "alarm") {
      soundUrl = "/sounds/alarm.mp3";
    } else if (soundName === "laugh") {
      soundUrl = "/sounds/laugh.mp3";
    }

    if (soundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(soundUrl);
      audio.volume = 0.5; // 50% Lautstärke
      audioRef.current = audio;
      audio.play();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && playerName) {
      sendMessage();
    }
  };

  if (!roomCode) {
    return null;
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
          height: "auto",
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
            marginBottom: "10px",
            maxHeight: "300px"
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{ marginBottom: "8px", cursor: msg.type === "sound" ? "pointer" : "default" }}
                onClick={() => {
                  if (msg.type === "sound") {
                    playSound(msg.sound);
                  }
                }}
              >
                <strong style={{ color: "#39c2ff" }}>{msg.sender}:</strong> {msg.type === "text" ? msg.text : `Play Sound ▶️`}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmojis(true)} // Emojis anzeigen bei Fokus
            disabled={!playerName}
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
              cursor: playerName ? "text" : "not-allowed",
              boxSizing: "border-box",
              marginBottom: "5px"
            }}
          />

          {/* Emoji Auswahl */}
          {showEmojis && (
            <div style={{
              marginBottom: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              justifyContent: "center"
            }}>
              {["😀", "😂", "😍", "😭", "😡", "👍", "👎", "🎉", "🔥", "🫃", "💀", "🗿"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setInput(input + emoji)}
                  style={{
                    fontSize: "20px",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Sound Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => sendSoundMessage("alarm")}
              style={{
                flex: 1,
                backgroundColor: "#ff3366",
                border: "none",
                borderRadius: "12px",
                padding: "8px",
                color: "white",
                cursor: "pointer"
              }}
            >
              🐔 Chicken Jockey
            </button>
            <button
              onClick={() => sendSoundMessage("laugh")}
              style={{
                flex: 1,
                backgroundColor: "#00cc66",
                border: "none",
                borderRadius: "12px",
                padding: "8px",
                color: "white",
                cursor: "pointer"
              }}
            >
              😂 Don Pollo
            </button>
          </div>
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
