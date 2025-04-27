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

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 text-white text-5xl">
      {showResults ? (
        <div className="mt-20 text-center">
          <h2 className="text-7xl mb-12 font-bold">Ergebnisse</h2>
          <p className="text-6xl mb-8">Am meisten Votes: {winner}</p>
          <p className="text-6xl mb-8">Der Imposter war: {imposterName}</p>

          {countdown > 0 ? (
            <p className="text-5xl mt-8 animate-pulse">Nächste Runde startet in {countdown} Sekunden...</p>
          ) : (
            players.find(p => p.name === playerName && p.id === hostId) && (
              <button onClick={startNewGame} className="mt-12 bg-blue-400 hover:bg-blue-500 text-white font-bold py-8 px-12 rounded-xl text-5xl shadow-lg">
                Neues Spiel starten
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {!roomCode && (
            <>
              <h1 className="text-9xl font-extrabold mb-16 mt-8">Anime Imposter 🎭</h1>
              <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-8 px-12 rounded-xl text-5xl mb-8 shadow-lg w-full" onClick={createRoom}>Neuen Raum erstellen</button>
              <input placeholder="Raumcode eingeben" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} className="my-6 text-black text-4xl p-8 w-full rounded-xl" />
              <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-8 px-12 rounded-xl text-5xl w-full shadow-lg" onClick={joinExistingRoom}>Bestehendem Raum beitreten</button>
              {errorMessage && <div className="text-red-400 text-4xl mt-6 font-bold">{errorMessage}</div>}
            </>
          )}

          {roomCode && !gameStarted && (
            <>
              <h2 className="text-7xl mb-8 font-bold">Raumcode: {roomCode}</h2>
              {!hasJoined && players.length < 8 && (
                <>
                  <input placeholder="Dein Name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="my-6 text-black text-4xl p-8 w-full rounded-xl" />
                  <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-8 px-12 rounded-xl text-5xl w-full mb-6 shadow-lg" onClick={joinRoom}>Beitreten</button>
                </>
              )}
              <div className="text-6xl mb-6 font-bold">Spieler ({players.length}/8):</div>
              {players.map((player) => (
                <div key={player.id} className="text-4xl mb-2">
                  {player.name} {player.id === hostId && "(Host)"}
                </div>
              ))}
              {players.length >= 3 && players.length <= 8 && hasJoined && players.find(p => p.name === playerName && p.id === hostId) && (
                <button onClick={startGame} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-8 px-12 rounded-xl text-5xl mt-12 shadow-lg">
                  Spiel starten
                </button>
              )}
            </>
          )}

          {gameStarted && (
            <>
              <h1 className="text-9xl font-extrabold mb-12 mt-6">Deine Rolle:</h1>
              <motion.div className="bg-blue-800 p-20 rounded-xl text-7xl font-bold shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {myRole || "Wird geladen..."}
              </motion.div>

              <div className="mt-20">
                <h3 className="text-6xl mb-8 font-bold">Wähle den Imposter:</h3>
                <div className="grid grid-cols-2 gap-6">
                  {players.map((player) => (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      key={player.id}
                      onClick={() => vote(player.name)}
                      disabled={votedPlayer !== ""}
                      className="bg-blue-400 hover:bg-blue-500 disabled:bg-gray-500 text-white font-bold py-6 px-10 rounded-xl text-4xl m-4 transition-all duration-300 shadow-lg"
                    >
                      {player.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {votedPlayer && (
                <div className="mt-12 text-center w-full">
                  <h4 className="text-5xl mb-6 font-bold">Du hast abgestimmt für: {votedPlayer}</h4>
                  <p className="text-4xl mb-8 animate-pulse">Voting läuft... Bitte warten</p>
                  <div className="w-full bg-white rounded-full h-10 mt-10">
                    <div
                      className="bg-green-600 h-10 rounded-full"
                      style={{
                        width: `${(votesCount / players.length) * 100}%`,
                        transition: "width 0.5s ease-in-out"
                      }}
                    ></div>
                  </div>
                  <p className="text-4xl mt-6 font-bold">{votesCount}/{players.length} Stimmen abgegeben</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}