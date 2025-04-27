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
  const [votes, setVotes] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [winner, setWinner] = useState("");
  const [imposterName, setImposterName] = useState("");
  const [votesCount, setVotesCount] = useState(0);

  useEffect(() => {
    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHostId(data.hostId);
          setGameStarted(data.gameStarted);
        }
      });

      const playersRef = ref(db, `rooms/${roomCode}/players`);
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(Object.values(data));
        }
      });
    }
  }, [roomCode]);

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
    }
  }, [gameStarted, roomCode, playerName]);

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
    const randomCharacter = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];
    const imposterIndex = Math.floor(Math.random() * players.length);
    const assignedRoles = players.map((player, index) => ({
      ...player,
      role: index === imposterIndex ? "Imposter" : randomCharacter
    }));

    assignedRoles.forEach((player) => {
      if (player && player.id && player.role) {
        update(ref(db, `rooms/${roomCode}/players/${player.id}`), { role: player.role });
      }
    });

    await update(ref(db, `rooms/${roomCode}`), { gameStarted: true, votes: {} });

    setShowResults(false);
    setVotedPlayer("");
    setVotes({});
    setVotesCount(0);
  }

  async function startNewGame() {
    await startGame();
  }

  async function vote(name) {
    if (roomCode && !votedPlayer) {
      const voteRef = ref(db, `rooms/${roomCode}/votes/${name}`);
      await set(voteRef, (votes[name] || 0) + 1);
      setVotedPlayer(name);

      const votesSnapshot = await get(ref(db, `rooms/${roomCode}/votes`));
      const votesData = votesSnapshot.val();
      if (votesData) {
        let totalVotes = Object.values(votesData).reduce((sum, v) => sum + v, 0);
        setVotesCount(totalVotes);

        const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
        const playersData = playersSnapshot.val();
        const playerCount = playersData ? Object.keys(playersData).length : 0;

        if (totalVotes >= playerCount) {
          const sortedVotes = Object.entries(votesData).sort((a, b) => b[1] - a[1]);
          if (sortedVotes.length > 0) {
            setWinner(sortedVotes[0][0]);
          }

          const imposter = Object.values(playersData).find(p => p.role === "Imposter");
          if (imposter) {
            setImposterName(imposter.name);
          }

          setShowResults(true);
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gradient-to-br from-blue-500 to-blue-800 text-white text-4xl">
      {!roomCode && (
        <>
          <h1 className="text-8xl font-extrabold mb-10">Anime Imposter 🎭</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl mb-6" onClick={createRoom}>Neuen Raum erstellen</button>
          <input placeholder="Raumcode eingeben" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} className="my-4 text-black text-3xl p-6 w-full rounded" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full" onClick={joinExistingRoom}>Bestehendem Raum beitreten</button>
          {errorMessage && <div className="text-red-400 text-3xl mt-4">{errorMessage}</div>}
        </>
      )}

      {roomCode && !gameStarted && (
        <>
          <h2 className="text-6xl mb-6">Raumcode: {roomCode}</h2>
          {!hasJoined && players.length < 8 && (
            <>
              <input placeholder="Dein Name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="my-4 text-black text-3xl p-6 w-full rounded" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full mb-4" onClick={joinRoom}>Beitreten</button>
            </>
          )}
          <div className="text-5xl mb-4">Spieler ({players.length}/8):</div>
          {players.map((player) => (
            <div key={player.id} className="text-3xl">
              {player.name} {player.id === hostId && "(Host)"}
            </div>
          ))}
          {players.length >= 3 && players.length <= 8 && hasJoined && players.find(p => p.name === playerName && p.id === hostId) && (
            <button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl mt-10">
              Spiel starten
            </button>
          )}
        </>
      )}

      {gameStarted && !showResults && (
        <>
          <h1 className="text-8xl font-extrabold mb-10">Deine Rolle:</h1>
          <motion.div className="bg-blue-700 p-16 rounded-lg text-6xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {myRole || "Wird geladen..."}
          </motion.div>

          <div className="mt-16">
            <h3 className="text-5xl mb-6">Wähle den Imposter:</h3>
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => vote(player.name)}
                disabled={votedPlayer !== ""}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded text-3xl m-4"
              >
                {player.name}
              </button>
            ))}
          </div>

          {votedPlayer && (
            <div className="mt-10 text-center">
              <h4 className="text-4xl mb-4">Du hast abgestimmt für: {votedPlayer}</h4>
              <p className="text-3xl mb-6">Warte, bis alle Spieler abgestimmt haben...</p>

              <div className="w-full bg-white rounded-full h-8 mt-8">
                <div
                  className="bg-green-600 h-8 rounded-full"
                  style={{
                    width: `${(votesCount / players.length) * 100}%`,
                    transition: "width 0.5s ease-in-out"
                  }}
                ></div>
              </div>

              <p className="text-3xl mt-4">
                {votesCount}/{players.length} Stimmen abgegeben
              </p>
            </div>
          )}
        </>
      )}

      {showResults && (
        <div className="mt-16 text-center">
          <h2 className="text-6xl mb-10">Ergebnisse</h2>
          <p className="text-5xl mb-6">Am meisten Votes: {winner}</p>
          <p className="text-5xl mb-6">Der Imposter war: {imposterName}</p>

          {players.find(p => p.name === playerName && p.id === hostId) && (
            <button onClick={startNewGame} className="mt-10 bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-10 rounded text-4xl">
              Neues Spiel starten
            </button>
          )}
        </div>
      )}
    </div>
  );
}
