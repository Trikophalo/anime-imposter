import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { db } from "./firebaseConfig";
import { ref, set, push, onValue, update, get } from "firebase/database";

const animeCharacters = [
  "Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake",
  "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Sanji", "Tony Tony Chopper",
  "Portgas D. Ace", "Goku", "Vegeta", "Piccolo", "Gohan", "Frieza",
  "Light Yagami", "L Lawliet", "Ryuk", "Edward Elric", "Alphonse Elric",
  "Roy Mustang", "Winry Rockbell", "Ichigo Kurosaki", "Rukia Kuchiki",
  "Uryu Ishida", "Orihime Inoue", "Saitama", "Genos", "Tatsumaki",
  "Mumen Rider", "Levi Ackerman", "Eren Yeager", "Mikasa Ackerman",
  "Armin Arlert", "Erwin Smith", "Rem", "Emilia", "Subaru Natsuki",
  "Natsu Dragneel", "Lucy Heartfilia", "Gray Fullbuster", "Erza Scarlet",
  "Saber", "Kirito", "Asuna", "Zero Two", "Ken Kaneki", "Touka Kirishima",
  "Shoto Todoroki", "Izuku Midoriya"
];

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

  useEffect(() => {
    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const playersRef = ref(db, `rooms/${roomCode}/players`);

      const unsubscribeRoom = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHostId(data.hostId);
          setGameStarted(data.gameStarted);
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
    });
  }

  async function joinExistingRoom() {
    if (joinRoomCode) {
      const roomRef = ref(db, `rooms/${joinRoomCode.toUpperCase()}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        setRoomCode(joinRoomCode.toUpperCase());
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

  async function startGame() {
    if (!players.length) return;

    const imposterIndex = Math.floor(Math.random() * players.length);
    const commonRole = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];

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

    const imposterIndex = Math.floor(Math.random() * playerList.length);
    const commonRole = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];

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

  // Verwende inline-Styles, die definitiv angewendet werden sollten
  const mainContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    minHeight: "100vh",
    backgroundColor: "#0a0a4a", // Sehr dunkles Blau
    color: "white",
    fontSize: "36px"
  };

  const titleStyle = {
    fontSize: "92px",
    fontWeight: "900",
    marginBottom: "40px",
    color: "#ff3366", // Knalliges Pink
    textShadow: "3px 3px 6px rgba(0,0,0,0.5)"
  };

  const buttonStyle = {
    backgroundColor: "#39c2ff", // Sehr helles Blau
    color: "white",
    fontWeight: "bold",
    padding: "20px 40px",
    borderRadius: "16px",
    fontSize: "36px",
    margin: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    border: "none",
    width: "100%"
  };

  const inputStyle = {
    padding: "20px",
    fontSize: "32px",
    width: "100%",
    borderRadius: "16px",
    margin: "20px 0",
    border: "none",
    color: "black"
  };

  return (
    <div style={mainContainerStyle}>
      {showResults ? (
        <div style={{marginTop: "80px", textAlign: "center"}}>
          <h2 style={{fontSize: "72px", marginBottom: "40px", fontWeight: "bold"}}>Ergebnisse</h2>
          <p style={{fontSize: "60px", marginBottom: "30px"}}>Am meisten Votes: {winner}</p>
          <p style={{fontSize: "60px", marginBottom: "30px"}}>Der Imposter war: {imposterName}</p>

          {countdown > 0 ? (
            <p style={{fontSize: "48px", marginTop: "30px"}}>Nächste Runde startet in {countdown} Sekunden...</p>
          ) : (
            players.find(p => p.name === playerName && p.id === hostId) && (
              <button onClick={startNewGame} style={{...buttonStyle, marginTop: "40px"}}>
                Neues Spiel starten
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {!roomCode && (
            <>
              <h1 style={titleStyle}>SUPER ANIME IMPOSTER GAME 2.0! 🎮</h1>
              <button style={buttonStyle} onClick={createRoom}>Neuen Raum erstellen</button>
              <input placeholder="Raumcode eingeben" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} style={inputStyle} />
              <button style={buttonStyle} onClick={joinExistingRoom}>Bestehendem Raum beitreten</button>
              {errorMessage && <div style={{color: "#ff4444", fontSize: "32px", marginTop: "20px", fontWeight: "bold"}}>{errorMessage}</div>}
            </>
          )}

          {roomCode && !gameStarted && (
            <>
              <h2 style={{fontSize: "72px", marginBottom: "30px", fontWeight: "bold"}}>Raumcode: {roomCode}</h2>
              {!hasJoined && players.length < 8 && (
                <>
                  <input placeholder="Dein Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={inputStyle} />
                  <button style={buttonStyle} onClick={joinRoom}>Beitreten</button>
                </>
              )}
              <div style={{fontSize: "60px", marginBottom: "20px", fontWeight: "bold"}}>Spieler ({players.length}/8):</div>
              {players.map((player) => (
                <div key={player.id} style={{fontSize: "36px", marginBottom: "10px"}}>
                  {player.name} {player.id === hostId && "(Host)"}
                </div>
              ))}
              {players.length >= 3 && players.length <= 8 && hasJoined && players.find(p => p.name === playerName && p.id === hostId) && (
                <button onClick={startGame} style={{...buttonStyle, marginTop: "40px"}}>
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
                  backgroundColor: "#1a1a8a", 
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
                <h3 style={{fontSize: "56px", marginBottom: "30px", fontWeight: "bold"}}>Wähle den Imposter:</h3>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                  {players.map((player) => (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      key={player.id}
                      onClick={() => vote(player.name)}
                      disabled={votedPlayer !== ""}
                      style={{
                        ...buttonStyle,
                        opacity: votedPlayer ? 0.6 : 1,
                        backgroundColor: votedPlayer === player.name ? "#ff3366" : "#39c2ff"
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