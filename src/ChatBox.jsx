import { useState, useEffect, useRef } from "react";
import { db } from "./firebaseConfig";
import { ref, push, onValue, off } from "firebase/database";
import { Send } from "lucide-react";

const MAX_MESSAGE_LENGTH = 100;

const ChatBox = ({ roomCode, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (roomCode) {
      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newMessages = Object.values(data);
          if (newMessages.length > messages.length && !isOpen) {
            setHasNewMessages(true);
          }
          setMessages(newMessages);
        }
      });

      return () => {
        off(chatRef);
      };
    }
  }, [roomCode, messages.length, isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "" || !playerName) return;
    const trimmed = input.trim().slice(0, MAX_MESSAGE_LENGTH);

    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    await push(chatRef, {
      sender: playerName,
      text: trimmed,
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
      audio.volume = 0.5;
      audioRef.current = audio;
      audio.play();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && playerName) {
      sendMessage();
    }
  };

  if (!roomCode) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "80px",
      left: "80px",
      zIndex: 100
    }}>
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewMessages(false);
          }}
          style={{
            position: "relative",
            backgroundColor: "#39c2ff",
            border: "none",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            fontSize: "40px",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            animation: "pulse 2s infinite"
          }}
        >
          💬
          {hasNewMessages && (
            <span style={{
              position: "absolute",
              top: "2px",
              right: "8px",
              width: "16px",
              height: "16px",
              backgroundColor: "red",
              borderRadius: "50%",
              border: "2px solid white"
            }}></span>
          )}
        </button>
      ) : (
        <div style={{
          width: "400px",
          height: "500px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.7)",
          color: "white",
          fontSize: "16px",
          transform: "scale(1)",
          animation: "pop 0.3s forwards"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}>
            <strong>Chat</strong>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "25px",
                cursor: "pointer"
              }}
            >
              ✖️
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "10px",
            marginBottom: "15px",
            maxHeight: "350px"
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{ marginBottom: "12px", cursor: msg.type === "sound" ? "pointer" : "default" }}
                onClick={() => {
                  if (msg.type === "sound") {
                    playSound(msg.sound);
                  }
                }}
              >
                <strong style={{ color: "#39c2ff", fontSize: "22px" }}>{msg.sender}:</strong>{" "}
                <span style={{ fontSize: "22px" }}>
                  {msg.type === "text" ? msg.text : `Play Sound ▶️`}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Eingabefeld mit Senden-Button */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
            <input
              value={input}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowEmojis(true)}
              disabled={!playerName}
              placeholder={playerName ? "Nachricht eingeben..." : "Bitte erst beitreten..."}
              title={`${input.length}/${MAX_MESSAGE_LENGTH} Zeichen`}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "12px",
                padding: "15px",
                fontSize: "16px",
                backgroundColor: playerName ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                color: "white",
                outline: "none",
                cursor: playerName ? "text" : "not-allowed",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!playerName || input.trim() === ""}
              title={!playerName ? "Bitte beitreten" : input.trim() === "" ? "Nachricht eingeben" : "Senden"}
              style={{
                backgroundColor: "#39c2ff",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: playerName && input.trim() !== "" ? "pointer" : "not-allowed",
                opacity: playerName && input.trim() !== "" ? 1 : 0.5
              }}
            >
              <Send size={20} color="white" />
            </button>
          </div>

          {showEmojis && (
            <div style={{
              marginBottom: "15px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center"
            }}>
              {["😀", "😂", "😍", "😭", "😡", "👍", "👎", "🎉", "🔥", "🫃", "💀", "🗿"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setInput(input + emoji)}
                  style={{
                    fontSize: "24px",
                    padding: "8px",
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

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <button
              onClick={() => sendSoundMessage("alarm")}
              style={{
                flex: 1,
                backgroundColor: "#ff3366",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "18px",
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
                padding: "12px",
                fontSize: "18px",
                color: "white",
                cursor: "pointer"
              }}
            >
              😂 Don Pollo
            </button>
          </div>
        </div>
      )}

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
