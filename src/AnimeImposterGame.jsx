import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { db } from "./firebaseConfig";
import { ref, set, push, onValue, update, get } from "firebase/database";
import BACKGROUND_MUSIC_URL from "./Quizshow.mp3";
import ChatBox from "./ChatBox"; // oder wo du sie speicherst


// Anime-Charaktere (bereits vorhanden)
const animeCharacters = [
  "Naruto Uzumaki", "Sasuke Uchiha", "Sakura", "Kakashi Hatake",
  "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Sanji", "Goku", "Vegeta", "Piccolo", "Gohan", "Frieza",
  "Light Yagami", "L Lawliet", "Ryuk", "Edward Elric", "Ichigo Kurosaki",
  "Uryu Ishida", "Orihime Inoue", "Saitama", "Genos", "Tatsumaki",
  "Mumen Rider", "Levi Ackerman", "Eren Yeager", "Mikasa Ackerman",
  "Armin Arlert", "Erwin Smith", "Rem", "Emilia", "Subaru Natsuki",
  "Natsu Dragneel", "Kirito", "Asuna", 
  "Zero Two", "Ken Kaneki", "Touka Kirishima",
  "Shoto Todoroki", "Izuku Midoriya"
];

// Allgemeinwissen (neu)
const generalKnowledgeItems = [
  "Albert Einstein", "Isaac Newton", "Galileo Galilei", "Marie Curie",
  "Charles Darwin", "Nikola Tesla", "Leonardo da Vinci", "Michelangelo",
  "William Shakespeare", "Mozart", "Beethoven", "Bach",
  "Napoleon Bonaparte", "Julius Cäsar", "Alexander der Große",
  "Mona Lisa", "Die Nachtwache", "Der Schrei", "Sternennacht",
  "Harry Potter", "Der Herr der Ringe", "Game of Thrones", "Star Wars",
  "Die Relativitätstheorie", "Thermodynamik", "Schwerkraft", "Elektromagnetismus",
  "Die Renaissance", "Die Aufklärung", "Die industrielle Revolution",
  "Das Periodic System", "DNA", "Photosynthese", "Zelltheorie",
  "Die Magna Carta", "Die Unabhängigkeitserklärung", "Die französische Revolution",
  "Das Internet", "Computer", "Smartphone", "Künstliche Intelligenz",
  "Impfung", "Antibiotika", "Röntgenstrahlung", "Mikroskop", "Teleskop",
  "Die Demokratie", "Der Kommunismus", "Der Kapitalismus", "Monarchie"
];

// Geographie (neu)
const geographyItems = [
  "Deutschland", "Frankreich", "Italien", "Spanien", "Vereinigtes Königreich",
  "USA", "Kanada", "Mexiko", "Brasilien", "Argentinien",
  "China", "Japan", "Indien", "Australien", "Russland",
  "Ägypten", "Südafrika", "Nigeria", "Kenia", "Marokko",
  "Amazon", "Nil", "Mississippi", "Yangtze", "Donau",
  "Himalaya", "Alpen", "Anden", "Rocky Mountains", "Atlas-Gebirge",
  "Pazifischer Ozean", "Atlantischer Ozean", "Indischer Ozean", "Arktischer Ozean",
  "Sahara", "Gobi", "Antarktis", "Amazonas-Regenwald", "Sibirische Taiga",
  "Tokio", "New York", "London", "Paris", "Peking",
  "Venedig", "Amsterdam", "Istanbul", "Rio de Janeiro", "Sydney"
];

// Marken (neu)
const brandItems = [
  "Apple", "Microsoft", "Google", "Amazon", "Facebook",
  "Coca-Cola", "Pepsi", "Fanta", "Sprite", "Dr Pepper",
  "Nike", "Adidas", "Puma", "Reebok", "Under Armour",
  "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Porsche",
  "McDonald's", "Burger King", "KFC", "Subway", "Pizza Hut",
  "Samsung", "Sony", "LG", "Panasonic", "Philips",
  "LEGO", "Mattel", "Hasbro", "Nintendo", "PlayStation",
  "Chanel", "Gucci", "Louis Vuitton", "Prada", "Versace",
  "Disney", "Netflix", "HBO", "Spotify", "YouTube",
  "IKEA", "H&M", "Zara", "Uniqlo", "Nike"
];

// Themenliste zur besseren Verwaltung
const themes = [
  { name: "Anime Charaktere", items: animeCharacters },
  { name: "Allgemeinwissen", items: generalKnowledgeItems },
  { name: "Geographie", items: geographyItems },
  { name: "Marken", items: brandItems }
];



// Simple moving Question Marks (smooth, sehr transparent, alle bewegen sich)
  const SimpleQuestionMarksBackground = () => {
  const numberOfMarks = 12; // 12 große Fragezeichen
  const [questionMarks, setQuestionMarks] = useState(
    Array.from({ length: numberOfMarks }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 210 + 190, // wie groß
      opacity: Math.random() * 0.03 + 0.01, // Jetzt sehr durchsichtig
      deltaTop: (Math.random() - 0.5) * 0.05,  // sehr langsame Bewegung
      deltaLeft: (Math.random() - 0.5) * 0.05
    }))
  );

  useEffect(() => {
    let animationFrameId;

    const moveMarks = () => {
      setQuestionMarks(prev =>
        prev.map(mark => {
          let newTop = mark.top + mark.deltaTop;
          let newLeft = mark.left + mark.deltaLeft;

          // Umkehren, wenn am Rand
          if (newTop <= 0 || newTop >= 100) mark.deltaTop *= -1;
          if (newLeft <= 0 || newLeft >= 100) mark.deltaLeft *= -1;

          return {
            ...mark,
            top: Math.min(Math.max(newTop, 0), 100),
            left: Math.min(Math.max(newLeft, 0), 100),
            deltaTop: mark.deltaTop,
            deltaLeft: mark.deltaLeft
          };
        })
      );

      animationFrameId = requestAnimationFrame(moveMarks);
    };

    animationFrameId = requestAnimationFrame(moveMarks);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
      backgroundColor: '#1a1a1a'
    }}>
      {questionMarks.map(mark => (
        <div
          key={mark.id}
          style={{
            position: 'absolute',
            top: `${mark.top}%`,
            left: `${mark.left}%`,
            fontSize: `${mark.size}px`,
            fontWeight: '900',
            color: `rgba(255, 255, 255, ${mark.opacity})`,
            userSelect: 'none',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.1s linear, left 0.1s linear'
          }}
        >
          ?
        </div>
      ))}
    </div>
  );
};







// MusicPlayer Komponente
const MusicPlayer = () => {
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

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

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: "10px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      zIndex: 100
    }}>
      <audio ref={audioRef} loop>
        <source src={BACKGROUND_MUSIC_URL} />
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
  );
};


// CopyToClipboard Komponente
const CopyToClipboard = ({ text }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div 
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        position: "relative"
      }}
    >
      {text}
      <motion.span
        style={{
          marginLeft: "10px",
          fontSize: "24px"
        }}
        whileHover={{ scale: 1.2 }}
      >
        📋
      </motion.span>
      
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#4caf50",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "16px",
            whiteSpace: "nowrap"
          }}
        >
          Kopiert!
        </motion.div>
      )}
    </div>
  );
};

export default function AnimeImposterGame() {
  const [roomCode, setRoomCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [myRole, setMyRole] = useState("");
  const [votedPlayer, setVotedPlayer] = useState("");
  const [votesCount, setVotesCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [winner, setWinner] = useState("");
  const [imposterName, setImposterName] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [selectedTheme, setSelectedTheme] = useState(0); // Standard: Anime Charaktere
  const [roomTheme, setRoomTheme] = useState(0); // Der im Raum ausgewählte Theme-Index
  const [startingPlayer, setStartingPlayer] = useState(0);


  useEffect(() => {
    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const playersRef = ref(db, `rooms/${roomCode}/players`);

      const unsubscribeRoom = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHostId(data.hostId);
          setGameStarted(data.gameStarted);
          if (data.themeIndex !== undefined) {
            setRoomTheme(data.themeIndex);
          }
          if (data.gameStarted) {
            setShowResults(false);
          }
        }
      });

      const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(Object.values(data));
          const me = Object.values(data).find(p => p.name === playerName);
          if (me && me.role) {
            setMyRole(me.role);
          }
        }
      });

      return () => {
        unsubscribeRoom();
        unsubscribePlayers();
      };
    }
  }, [roomCode, playerName]);

  useEffect(() => {
    if (gameStarted && roomCode) {
      const votesRef = ref(db, `rooms/${roomCode}/votes`);
      const playersRef = ref(db, `rooms/${roomCode}/players`);

      const unsubscribeVotes = onValue(votesRef, async (snapshot) => {
        const votesData = snapshot.val();
        const playersSnapshot = await get(playersRef);
        const playersData = playersSnapshot.val();
        const playerCount = playersData ? Object.keys(playersData).length : 0;
        const totalVotes = votesData ? Object.keys(votesData).length : 0;

        setVotesCount(totalVotes);

        if (totalVotes >= playerCount && !showResults) {
          const voteCounts = {};
          Object.values(votesData).forEach((votedName) => {
            voteCounts[votedName] = (voteCounts[votedName] || 0) + 1;
          });
          const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
          if (sortedVotes.length > 0) {
            setWinner(sortedVotes[0][0]);
          }

          const imposter = Object.values(playersData).find(p => p.role === "Imposter");
          if (imposter) {
            setImposterName(imposter.name);
          }

          await update(ref(db, `rooms/${roomCode}`), { gameStarted: false });
          setShowResults(true);
        }
      });

      return () => unsubscribeVotes();
    }
  }, [gameStarted, roomCode, showResults]);

  useEffect(() => {
    if (gameStarted && roomCode && playerName) {
      const playersRef = ref(db, `rooms/${roomCode}/players`);
      get(playersRef).then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          const playerList = Object.values(data);
          const me = playerList.find(p => p.name === playerName);
          if (me && me.role) {
            setMyRole(me.role);
          }
        }
      });
      setVotedPlayer("");
    }
  }, [gameStarted, roomCode, playerName]);

  useEffect(() => {
    if (showResults) {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showResults]);

  async function createRoom() {
    const newRoomCode = uuidv4().slice(0, 5).toUpperCase();
    setRoomCode(newRoomCode);
    await set(ref(db, `rooms/${newRoomCode}`), {
      players: [],
      gameStarted: false,
      votes: {},
      hostId: null,
      themeIndex: 0 // Standard-Theme: Anime Charaktere
    });
  }

  async function joinExistingRoom() {
    if (joinRoomCode) {
      const roomRef = ref(db, `rooms/${joinRoomCode.toUpperCase()}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        setRoomCode(joinRoomCode.toUpperCase());
        const roomData = snapshot.val();
        if (roomData.themeIndex !== undefined) {
          setRoomTheme(roomData.themeIndex);
        }
        setErrorMessage("");
      } else {
        setErrorMessage("Raum existiert nicht!");
      }
    }
  }

  async function joinRoom() {
    if (playerName && roomCode && !hasJoined && players.length < 8) {
      const playerRef = push(ref(db, `rooms/${roomCode}/players`));
      await set(playerRef, { name: playerName, id: playerRef.key });
      const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
      const playersData = playersSnapshot.val();
      if (playersData && Object.keys(playersData).length === 1) {
        update(ref(db, `rooms/${roomCode}`), { hostId: playerRef.key });
      }
      setHasJoined(true);
    }
  }

  async function changeTheme(themeIndex) {
    if (roomCode && hostId && players.find(p => p.name === playerName && p.id === hostId)) {
      await update(ref(db, `rooms/${roomCode}`), { themeIndex: themeIndex });
      setSelectedTheme(themeIndex);
    }
  }

  async function startGame() {
    if (!players.length) return;
    setStartingPlayer(Math.floor(Math.random() * players.length));
    const imposterIndex = Math.floor(Math.random() * players.length);
    // Verwende das ausgewählte Thema
    const themeItems = themes[roomTheme].items;
    const commonRole = themeItems[Math.floor(Math.random() * themeItems.length)];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      await update(ref(db, `rooms/${roomCode}/players/${player.id}`), {
        role: i === imposterIndex ? "Imposter" : commonRole
      });
    }

    await update(ref(db, `rooms/${roomCode}`), { gameStarted: true, votes: {} });
  }

  async function startNewGame() {
    if (!players.length) return;

    await update(ref(db, `rooms/${roomCode}`), { votes: {}, gameStarted: false });

    const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
    const playersData = playersSnapshot.val();
    const playerList = playersData ? Object.values(playersData) : [];
    setStartingPlayer(Math.floor(Math.random() * players.length));
    const imposterIndex = Math.floor(Math.random() * playerList.length);
    // Verwende das ausgewählte Thema
    const themeItems = themes[roomTheme].items;
    const commonRole = themeItems[Math.floor(Math.random() * themeItems.length)];

    for (let i = 0; i < playerList.length; i++) {
      const player = playerList[i];
      await update(ref(db, `rooms/${roomCode}/players/${player.id}`), {
        role: i === imposterIndex ? "Imposter" : commonRole
      });
    }

    await update(ref(db, `rooms/${roomCode}`), { gameStarted: true });

    setShowResults(false);
    setVotedPlayer("");
    setVotesCount(0);
  }

  async function vote(name) {
    if (roomCode && !votedPlayer) {
      const voteRef = ref(db, `rooms/${roomCode}/votes/${playerName}`);
      await set(voteRef, name);
      setVotedPlayer(name);
    }
  }

  // Styles
  const mainContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    minHeight: "100vh",
    color: "white",
    fontSize: "36px",
    position: "relative",
    zIndex: 1
  };

  const titleStyle = {
    fontSize: "80px",
    fontWeight: "900",
    marginBottom: "20px",
    color: "#ff3366",
    textShadow: "3px 3px 6px rgba(0,0,0,0.5)"
  };

  const buttonStyle = {
    backgroundColor: "#39c2ff",
    color: "white",
    fontWeight: "bold",
    padding: "15px 30px",
    borderRadius: "12px",
    fontSize: "32px",
    margin: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    border: "none",
    width: "30%",
    transition: "background-color 0.3s ease"
  };

  const inputStyle = {
    padding: "15px",
    fontSize: "32px",
    width: "30%",
    borderRadius: "12px",
    margin: "20px 0",
    border: "none",
    color: "black"
  };

  // Themes selector style
  const themeButtonStyle = {
    backgroundColor: "#39c2ff",
    color: "white",
    fontWeight: "bold",
    padding: "15px 30px",
    borderRadius: "12px",
    fontSize: "28px",
    margin: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    border: "none",
    transition: "background-color 0.3s ease"
  };

  const selectedThemeButtonStyle = {
    ...themeButtonStyle,
    backgroundColor: "#ff3366",
    transform: "scale(1.05)"
  };

  return (
    <div style={mainContainerStyle}>
      <SimpleQuestionMarksBackground />
      <MusicPlayer />
      <ChatBox roomCode={roomCode} playerName={playerName} />

      {showResults ? (
        <div style={{marginTop: "80px", textAlign: "center"}}>
          <h2 style={{fontSize: "72px", marginBottom: "40px", fontWeight: "bold"}}>Ergebnisse</h2>
          <p style={{fontSize: "60px", marginBottom: "30px"}}>Am meisten Votes: <span style={{fontWeight: "bold"}}>{winner}</span></p>
          <p style={{fontSize: "60px", marginBottom: "30px"}}>
            Der Imposter war: <span style={{fontWeight: "bold", color: "#ff3366"}}>{imposterName}</span>
          </p>

          {countdown > 0 ? (
            <p style={{fontSize: "48px", marginTop: "30px"}}>Nächste Runde startet in {countdown} Sekunden...</p>
          ) : (
            players.find(p => p.name === playerName && p.id === hostId) && (
              <button 
                onClick={startNewGame} 
                style={{...buttonStyle, marginTop: "40px", width: "100%"}}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2ba3db"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#39c2ff"}
              >
                Neues Spiel starten
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {!roomCode && (
            <>
              <h1 style={titleStyle}>Guess the Imposter 👩‍🦯‍➡️</h1>
              <button 
                style={{...buttonStyle, margin: "100px", backgroundColor: "#00c71e", fontSize: "50px", width: "50%"}}
                onClick={createRoom}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#00a419"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#00c71e"}
              >
                Neuen Raum erstellen
              </button>
              <input placeholder="Raumcode eingeben" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} style={inputStyle} />
              <button 
                style={buttonStyle} 
                onClick={joinExistingRoom}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2ba3db"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#39c2ff"}
              >
                Raum beitreten
              </button>
              {errorMessage && <div style={{color: "#ff4444", fontSize: "32px", marginTop: "20px", fontWeight: "bold"}}>{errorMessage}</div>}
            </>
          )}

          {roomCode && !gameStarted && (
            <>
              <h2 style={{fontSize: "72px", marginBottom: "30px", fontWeight: "bold"}}>
                Raumcode: <CopyToClipboard text={roomCode} />
              </h2>
              {!hasJoined && players.length < 8 && (
                <>
                  <input placeholder="Dein Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={inputStyle} />
                  <button 
                    style={buttonStyle} 
                    onClick={joinRoom}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2ba3db"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#39c2ff"}
                  >
                    Beitreten
                  </button>
                </>
              )}
              
              {/* Themenauswahl für den Host */}
              {hasJoined && players.find(p => p.name === playerName && p.id === hostId) && !gameStarted && (
                <div style={{marginTop: "20px", marginBottom: "40px", textAlign: "center", width: "100%"}}>
                  <h3 style={{fontSize: "48px", marginBottom: "20px", fontWeight: "bold"}}>Wähle ein Thema:</h3>
                  <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px"}}>
                    {themes.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => changeTheme(index)}
                        style={roomTheme === index ? selectedThemeButtonStyle : themeButtonStyle}
                        onMouseOver={(e) => {
                          if (roomTheme !== index) {
                            e.currentTarget.style.backgroundColor = "#2ba3db";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (roomTheme !== index) {
                            e.currentTarget.style.backgroundColor = "#39c2ff";
                          }
                        }}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                  <p style={{fontSize: "32px", marginTop: "15px"}}>Aktuelles Thema: <span style={{fontWeight: "bold", color: "#ff3366"}}>{themes[roomTheme].name}</span></p>
                </div>
              )}
              
              {/* Wenn nicht Host, zeige ausgewähltes Thema an */}
              {hasJoined && !players.find(p => p.name === playerName && p.id === hostId) && !gameStarted && (
                <div style={{marginTop: "20px", marginBottom: "20px", textAlign: "center"}}>
                  <p style={{fontSize: "36px"}}>Ausgewähltes Thema: <span style={{fontWeight: "bold", color: "#ff3366"}}>{themes[roomTheme].name}</span></p>
                </div>
              )}

              <div style={{fontSize: "60px", marginBottom: "20px", fontWeight: "bold"}}>Spieler ({players.length}/8):</div>
              {players.map((player) => (
                <div key={player.id} style={{fontSize: "36px", marginBottom: "10px"}}>
                  {player.name} {player.id === hostId && "(Host)"}
                </div>
              ))}
              {players.length >= 3 && players.length <= 8 && hasJoined && players.find(p => p.name === playerName && p.id === hostId) && (
                <button 
                  onClick={startGame} 
                  style={{...buttonStyle, marginTop: "40px"}}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2ba3db"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#39c2ff"}
                >
                  Spiel starten
                </button>
              )}
            </>
          )}

          {gameStarted && (
            <>
              <h1 style={{fontSize: "80px", fontWeight: "900", marginBottom: "40px", color: "#ff3366"}}>Deine Rolle:</h1>
              <motion.div 
                style={{
                  backgroundColor: myRole === "Imposter" ? "#ff3366" : "#1a1a8a", 
                  padding: "60px", 
                  borderRadius: "20px", 
                  fontSize: "64px", 
                  fontWeight: "bold",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.5)"
                }} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
                {myRole || "Wird geladen..."}
              </motion.div>

              <div style={{marginTop: "60px"}}>
                {players.find(p => p.name === playerName && p.id === hostId) && ( <h3 style={{fontSize: "56px", marginBottom: "30px", fontWeight: "bold", color: "#ef7f00"}}>Es beginnt: {players[startingPlayer].name}</h3>)}
                <h3 style={{fontSize: "56px", marginBottom: "30px", fontWeight: "bold"}}>Wähle den Imposter:</h3>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                  {players.map((player) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={player.id}
                      onClick={() => vote(player.name)}
                      disabled={votedPlayer !== ""}
                      style={{
                        ...buttonStyle, width: "100%",
                        opacity: votedPlayer ? 0.6 : 1,
                        backgroundColor: votedPlayer === player.name ? "#ff3366" : "#39c2ff"
                      }}
                      onMouseOver={(e) => {
                        if (votedPlayer !== player.name) {
                          e.currentTarget.style.backgroundColor = "#2ba3db";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (votedPlayer !== player.name) {
                          e.currentTarget.style.backgroundColor = "#39c2ff";
                        }
                      }}
                    >
                      {player.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {votedPlayer && (
                <div style={{marginTop: "60px", textAlign: "center", width: "100%"}}>
                  <h4 style={{fontSize: "48px", marginBottom: "20px", fontWeight: "bold"}}>Du hast abgestimmt für: {votedPlayer}</h4>
                  <p style={{fontSize: "36px", marginBottom: "30px"}}>Voting läuft... Bitte warten</p>
                  <div style={{width: "100%", backgroundColor: "white", borderRadius: "20px", height: "20px"}}>
                    <div
                      style={{
                        backgroundColor: "#00cc66",
                        height: "20px",
                        borderRadius: "20px",
                        width: `${(votesCount / players.length) * 100}%`,
                        transition: "width 0.5s ease-in-out"
                      }}
                    ></div>
                  </div>
                  <p style={{fontSize: "36px", marginTop: "20px", fontWeight: "bold"}}>{votesCount}/{players.length} Stimmen abgegeben</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}