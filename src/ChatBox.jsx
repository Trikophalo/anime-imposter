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
      return () => off(chatRef);
    }
  }, [roomCode, messages.length, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    let soundUrl = soundName === "alarm" ? "/sounds/alarm.mp3" :
                   soundName === "laugh" ? "/sounds/laugh.mp3" : "";
    if (!soundUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!roomCode) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "80px",
        zIndex: 100
      }}
    >
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
            animation: "pulse 2s infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
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
        <div
          style={{
            width: "330px",
            maxWidth: "90vw", // Responsive!
            height: "500px",
            backgroundColor: "rgba(0,0,0,0.85)",
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
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "24px" }}>
            <strong>Chat</strong>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer"
              }}
            >
              ✖️
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", marginBottom: "15px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{ marginBottom: "12px", cursor: msg.type === "sound" ? "pointer" : "default" }}
                onClick={() => msg.type === "sound" && playSound(msg.sound)}
              >
                <strong style={{ color: "#39c2ff", fontSize: "20px" }}>{msg.sender}:</strong>{" "}
                <span style={{ fontSize: "20px" }}>
                  {msg.type === "text" ? msg.text : `▶️ Ton abspielen`}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input
              value={input}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!playerName}
              placeholder={playerName ? "Nachricht eingeben..." : "Bitte erst beitreten..."}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "16px",
                backgroundColor: playerName ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                color: "white",
                outline: "none",
                cursor: playerName ? "text" : "not-allowed"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!playerName || input.trim() === ""}
              style={{
                backgroundColor: "#39c2ff",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: playerName && input.trim() ? "pointer" : "not-allowed",
                opacity: playerName && input.trim() ? 1 : 0.5
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
          {isOpen && (
            <div style={{
              marginBottom: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center"
            }}>
              {["😀", "😂", "😍", "😭", "😡", "👍", "👎", "🎉", "🔥", "🫃", "💀", "🗿"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setInput(input + emoji)}
                  style={{
                    fontSize: "22px",
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

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => sendSoundMessage("alarm")}
              style={{
                flex: 1,
                backgroundColor: "#ff3366",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "16px",
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
                borderRadius: "10px",
                padding: "10px",
                fontSize: "16px",
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
