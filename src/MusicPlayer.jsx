// MusicPlayer.jsx
import { useState, useEffect, useRef } from "react";
import BACKGROUND_MUSIC_URL from "./Lofi.mp3";
import BACKGROUND_MUSIC_URL_2 from "./Domestic.mp3";
import BACKGROUND_MUSIC_URL_3 from "./Paradise.mp3";

export default function MusicPlayer() {
  const [volume, setVolume] = useState(0.1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  const musicTracks = [BACKGROUND_MUSIC_URL, BACKGROUND_MUSIC_URL_2, BACKGROUND_MUSIC_URL_3];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleUserGesture = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log('Audio konnte nicht automatisch gestartet werden:', err);
        });
      }
      document.removeEventListener('click', handleUserGesture);
    };

    document.addEventListener('click', handleUserGesture);

    return () => {
      document.removeEventListener('click', handleUserGesture);
    };
  }, []);

  const handleChangeMusic = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % musicTracks.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicTracks[currentTrackIndex];
      audioRef.current.play().catch((err) => console.log("Fehler beim Abspielen", err));
    }
  }, [currentTrackIndex]);

  return (
    <>
      <div style={{
        position: "fixed",
        top: "40px",
        right: "40px",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "10px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        zIndex: 100
      }}>
        <audio ref={audioRef} loop>
          <source src={musicTracks[currentTrackIndex]} />
          Dein Browser unterstützt kein Audio-Element.
        </audio>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "24px",
            marginRight: "10px"
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            width: "100px",
            accentColor: "#ff3366"
          }}
        />
      </div>

      <button 
    onClick={handleChangeMusic}
    style={{
      position: "fixed",
      bottom: "60px",
      right: "60px",
      background: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
      backgroundSize: "400% 400%",
      animation: "rainbowBackground 8s ease infinite",
      border: "none",
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      padding: "0",
      overflow: "hidden",
      cursor: "pointer",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
    title="Musik wechseln"
  >
    <img 
      src="/pics/MusicIcons.png" 
      alt="Musik wechseln" 
      style={{ 
        width: "60%", 
        height: "60%", 
        objectFit: "contain", 
        borderRadius: "50%",
        backgroundColor: "transparent",
        zIndex: 2,
        pointerEvents: "none",
        animation: "pulse 2s infinite ease-in-out"
      }} 
    />
  </button>

  <style>{`
    @keyframes rainbowBackground {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes pulse {
      0% { transform: scale(1.8); }
      50% { transform: scale(2.1); }
      100% { transform: scale(1.8); }
    }
  `}</style>

    </>
  );
}
