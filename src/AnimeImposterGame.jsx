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

  function createRoom() { ... }
  async function joinExistingRoom() { ... }
  async function joinRoom() { ... }

  useEffect(() => { ... }, [roomCode]);
  useEffect(() => { ... }, [gameStarted, roomCode, playerName]);
  async function startGame() { ... }
  function vote(name) { ... }

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gradient-to-br from-blue-500 to-blue-800 text-white text-4xl">
      {!gameStarted ? (
        <>
          <h1 className="text-8xl font-extrabold mb-10">Anime Imposter 🎭</h1>
          <h2 className="text-6xl mb-6">Raumcode: {roomCode}</h2>
          <div className="text-5xl mb-4">Spieler ({players.length}/8):</div>
          {players.map((player) => (
            <div key={player.id} className="text-3xl">
              {player.name} {player.id === hostId && "(Host)"}
            </div>
          ))}
          {playerName && players.find(p => p.name === playerName && p.id === hostId) && (
            <button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded text-4xl mt-10">
              Spiel starten
            </button>
          )}
        </>
      ) : (
        <>
          <h1 className="text-8xl font-extrabold mb-10">Deine Rolle:</h1>
          <div className="bg-blue-700 p-16 rounded-lg text-6xl font-bold">
            {myRole || "Wird geladen..."}
          </div>

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
            <div className="mt-10">
              <h4 className="text-4xl">Du hast abgestimmt für: {votedPlayer}</h4>
            </div>
          )}
        </>
      )}
    </div>
  );
}
