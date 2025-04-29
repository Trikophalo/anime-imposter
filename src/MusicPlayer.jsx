import { useState, useEffect, useRef } from "react";
import BACKGROUND_MUSIC_URL from "./Lofi.mp3";
import BACKGROUND_MUSIC_URL_2 from "./Domestic.mp3";
import BACKGROUND_MUSIC_URL_3 from "./Paradise.mp3";

export default function MusicPlayer() {
  const [userVolume, setUserVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  const musicTracks = [
    { url: BACKGROUND_MUSIC_URL, baseVolume: 0.1 },
    { url: BACKGROUND_MUSIC_URL_2, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_3, baseVolume: 0.05 },
  ];

  useEffect(() => {
    const handleUserGesture = () => {
      if (audioRef.current) {
        const currentTrack = musicTracks[currentTrackIndex];
        audioRef.current.src = currentTrack.url;
        audioRef.current.volume = isMuted ? 0 : currentTrack.baseVolume * userVolume;
        audioRef.current.loop = true;
        audioRef.current.play().catch((err) => {
          console.log("Audio konnte nicht automatisch gestartet werden:", err);
        });
      }
      document.removeEventListener("click", handleUserGesture);
    };

    document.addEventListener("click", handleUserGesture);
    return () => {
      document.removeEventListener("click", handleUserGesture);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicTracks[currentTrackIndex].url;
      audioRef.current.loop = true;
      const finalVolume = isMuted ? 0 : musicTracks[currentTrackIndex].baseVolume * userVolume;
      audioRef.current.volume = Math.min(finalVolume, 1);
      audioRef.current.play().catch((err) => console.log("Fehler beim Abspielen", err));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      const finalVolume = isMuted ? 0 : musicTracks[currentTrackIndex].baseVolume * userVolume;
      audioRef.current.volume = Math.min(finalVolume, 1);
    }
  }, [userVolume, isMuted, currentTrackIndex]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleChangeMusic = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % musicTracks.length);
  };

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src={musicTracks[currentTrackIndex].url} />
        Dein Browser unterstützt kein Audio-Element.
      </audio>

      {/* Lautstärke-Einstellung */}
      <div
        style={{
          position: "fixed",
          top: "40px",
          right: "40px",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "10px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "24px",
            marginRight: "10px",
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={userVolume}
          onChange={(e) => setUserVolume(parseFloat(e.target.value))}
          style={{
            width: "100px",
            accentColor: "#ff3366",
          }}
        />
      </div>

      {/* Musik-Wechsel-Button mit Hover-Effekt */}
      <div
        onClick={handleChangeMusic}
        title="Musik wechseln"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "190px",
          height: "190px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="/pics/Radio_Icon.png"
          alt="Musik wechseln"
          style={{
            width: "60%",
            height: "60%",
            objectFit: "contain",
            borderRadius: "50%",
            backgroundColor: "transparent",
            animation: "pulse 2s infinite ease-in-out",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
