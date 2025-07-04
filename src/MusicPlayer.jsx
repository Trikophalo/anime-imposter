import { useState, useEffect, useRef } from "react";
import BACKGROUND_MUSIC_URL from "./Lofi.mp3";
import BACKGROUND_MUSIC_URL_2 from "./Musik1.mp3";
import BACKGROUND_MUSIC_URL_3 from "./Musik2.mp3";
import BACKGROUND_MUSIC_URL_4 from "./Musik3.mp3";
import BACKGROUND_MUSIC_URL_5 from "./Musik4.mp3";
import BACKGROUND_MUSIC_URL_6 from "./Musik5.mp3";
import BACKGROUND_MUSIC_URL_7 from "./Musik6.mp3";
import BACKGROUND_MUSIC_URL_8 from "./Musik7.mp3";
import BACKGROUND_MUSIC_URL_9 from "./Musik8.mp3";
import BACKGROUND_MUSIC_URL_10 from "./Musik9.mp3";

export default function MusicPlayer({ showPlayer, isMobile }) {
  const [userVolume, setUserVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  const musicTracks = [
    { url: BACKGROUND_MUSIC_URL, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_2, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_3, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_4, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_5, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_6, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_7, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_8, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_9, baseVolume: 0.15 },
    { url: BACKGROUND_MUSIC_URL_10, baseVolume: 0.15 },
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

  if (!showPlayer || isMobile) return null;

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src={musicTracks[currentTrackIndex].url} />
        Dein Browser unterstützt kein Audio-Element.
      </audio>

      <div
        style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          padding: "2px 6px",
          borderRadius: "6px",
          transform: "scale(0.85)"
        }}
      >
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "30px",
            marginRight: "0px"
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
            width: "90px",
            accentColor: "#ff3366"
          }}
        />
      </div>

      <div
        onClick={handleChangeMusic}
        title="Musik wechseln"
        style={{
          position: "fixed",
          bottom: "50px",
          right: "50px",
          width: "90px",
          height: "90px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="/pics/Radio_Icon.png"
          alt="Musik wechseln"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "50%",
            backgroundColor: "transparent",
            animation: "pulse 2s infinite ease-in-out"
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
