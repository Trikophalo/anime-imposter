import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { db } from "./firebaseConfig";
import { ref, set, push, onValue, update, get } from "firebase/database";

const animeCharacters = [
  "Naruto Uzumaki",
  "Sasuke Uchiha",
  "Sakura Haruno",
  "Kakashi Hatake",
  "Monkey D. Luffy",
  "Roronoa Zoro",
  "Nami",
  "Sanji",
  "Tony Tony Chopper",
  "Portgas D. Ace",
  "Goku",
  "Vegeta",
  "Piccolo",
  "Gohan",
  "Frieza",
  "Light Yagami",
  "L Lawliet",
  "Ryuk",
  "Edward Elric",
  "Alphonse Elric",
  "Roy Mustang",
  "Winry Rockbell",
  "Ichigo Kurosaki",
  "Rukia Kuchiki",
  "Uryu Ishida",
  "Orihime Inoue",
  "Saitama",
  "Genos",
  "Tatsumaki",
  "Mumen Rider",
  "Levi Ackerman",
  "Eren Yeager",
  "Mikasa Ackerman",
  "Armin Arlert",
  "Erwin Smith",
  "Rem",
  "Emilia",
  "Subaru Natsuki",
  "Natsu Dragneel",
  "Lucy Heartfilia",
  "Gray Fullbuster",
  "Erza Scarlet",
  "Saber",
  "Kirito",
  "Asuna",
  "Zero Two",
  "Ken Kaneki",
  "Touka Kirishima",
  "Shoto Todoroki",
  "Izuku Midoriya"
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

  function createRoom() {
    const newRoomCode = uuidv4().slice(0, 5).toUpperCase();
    setRoomCode(newRoomCode);
    set(ref(db, `rooms/${newRoomCode}`), {
      players: [],
      gameStarted: false,
      votes: {}
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

  function joinRoom() {
    if (playerName && roomCode && !hasJoined && players.length < 8) {
      const playerRef = push(ref(db, `rooms/${roomCode}/players`));
      set(playerRef, { name: playerName, id: playerRef.key });
      setHasJoined(true);
    }
  }

  useEffect(() => {
    if (roomCode) {
      const playersRef = ref(db, `rooms/${roomCode}/players`);
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const playerList = Object.values(data);
          setPlayers(playerList);
        }
      });

      const votesRef = ref(db, `rooms/${roomCode}/votes`);
      onValue(votesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setVotes(data);
        }
      });
    }
  }, [roomCode]);

  function startGame() {
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
    update(ref(db, `rooms/${roomCode}`), { gameStarted: true });
    setGameStarted(true);
    const myAssignedRole = assignedRoles.find(p => p.name === playerName)?.role;
    setMyRole(myAssignedRole);
  }

  function vote(name) {
    if (roomCode) {
      const voteRef = ref(db, `rooms/${roomCode}/votes/${name}`);
      set(voteRef, (votes[name] || 0) + 1);
      setVotedPlayer(name);
    }
  }

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gradient-to-br from-blue-500 to-blue-800 text-white text-4xl">
      {!roomCode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-8xl font-extrabold mb-10">Anime Imposter 🎭</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl mb-6" onClick={createRoom}>Neuen Raum erstellen</button>
          <input placeholder="Raumcode eingeben" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} className="my-4 text-black text-3xl p-6 w-full rounded" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full" onClick={joinExistingRoom}>Bestehendem Raum beitreten</button>
          {errorMessage && <div className="text-red-400 text-3xl mt-4">{errorMessage}</div>}
        </motion.div>
      )}

      {roomCode && !gameStarted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-4xl">
          <h2 className="text-6xl mb-6">Raumcode: {roomCode}</h2>
          {!hasJoined && players.length < 8 && (
            <>
              <input placeholder="Dein Name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="my-4 text-black text-3xl p-6 w-full rounded" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full mb-4" onClick={joinRoom}>Beitreten</button>
            </>
          )}
          {hasJoined && (
            <div className="text-4xl mb-4">Warte auf weitere Spieler...</div>
          )}
          <div className="mt-10">
            <h3 className="text-5xl mb-4">Spieler ({players.length}/8):</h3>
            {players.map((player, idx) => (
              <div key={idx} className="text-3xl">{player.name}</div>
            ))}
          </div>
          {players.length >= 3 && players.length <= 8 && hasJoined && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full mt-10" onClick={startGame}>Spiel starten</button>
          )}
        </motion.div>
      )}

      {gameStarted && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-4xl text-center">
          <h2 className="text-6xl font-bold mb-10">Deine Rolle:</h2>
          <div className="bg-blue-700 p-16 rounded-lg">
            <div className="text-6xl font-bold">{myRole}</div>
          </div>

          <div className="mt-16">
            <h3 className="text-5xl mb-6">Wähle den Imposter:</h3>
            {players.map((player, idx) => (
              <button key={idx} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-3xl m-4" onClick={() => vote(player.name)} disabled={votedPlayer !== ""}>
                {player.name}
              </button>
            ))}
          </div>

          {votedPlayer && (
            <div className="mt-10">
              <h4 className="text-4xl">Du hast abgestimmt für: {votedPlayer}</h4>
            </div>
          )}

          {Object.keys(votes).length === players.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mt-16">
              <h3 className="text-5xl mb-6">Abstimmungsergebnisse:</h3>
              {Object.entries(votes).map(([name, count]) => (
                <div key={name} className="text-3xl">{name}: {count} Stimmen</div>
              ))}
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded text-4xl w-full mt-10" onClick={() => window.location.reload()}>Neues Spiel</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}