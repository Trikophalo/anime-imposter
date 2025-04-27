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

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-blue-100 text-blue-900 text-5xl">
      {showResults ? (
        <div className="mt-16 text-center">
          <h2 className="text-9xl font-extrabold mb-10">Ergebnisse</h2>
          <p className="text-6xl mb-6">Am meisten Votes: {winner}</p>
          <p className="text-6xl mb-6">Der Imposter war: {imposterName}</p>
  
          {countdown > 0 ? (
            <p className="text-5xl mt-6 animate-pulse">Nächste Runde startet in {countdown} Sekunden...</p>
          ) : (
            players.find(p => p.name === playerName && p.id === hostId) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={startNewGame}
                className="mt-10 bg-blue-500 hover:bg-blue-600 text-white font-bold py-8 px-16 rounded-2xl text-6xl transition-all duration-300"
              >
                Neues Spiel starten
              </motion.button>
            )
          )}
        </div>
      ) : (
        <>
          {!roomCode && (
            <>
              <h1 className="text-9xl font-extrabold mb-10">Anime Imposter 🎭</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={createRoom}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-8 px-16 rounded-2xl text-6xl mb-8 transition-all duration-300"
              >
                Neuen Raum erstellen
              </motion.button>
              <input
                placeholder="Raumcode eingeben"
                value={joinRoomCode}
                onChange={e => setJoinRoomCode(e.target.value)}
                className="my-8 text-black text-5xl p-8 w-full max-w-xl rounded-2xl"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={joinExistingRoom}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-8 px-16 rounded-2xl text-6xl w-full max-w-xl transition-all duration-300"
              >
                Bestehendem Raum beitreten
              </motion.button>
              {errorMessage && <div className="text-red-500 text-5xl mt-8">{errorMessage}</div>}
            </>
          )}
  
          {roomCode && !gameStarted && (
            <>
              <h2 className="text-8xl mb-8">Raumcode: {roomCode}</h2>
              {!hasJoined && players.length < 8 && (
                <>
                  <input
                    placeholder="Dein Name"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    className="my-8 text-black text-5xl p-8 w-full max-w-xl rounded-2xl"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={joinRoom}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-8 px-16 rounded-2xl text-6xl w-full max-w-xl transition-all duration-300"
                  >
                    Beitreten
                  </motion.button>
                </>
              )}
              <div className="text-6xl mb-8">Spieler ({players.length}/8):</div>
              {players.map((player) => (
                <div key={player.id} className="text-5xl">
                  {player.name} {player.id === hostId && "(Host)"}
                </div>
              ))}
              {players.length >= 3 && players.length <= 8 && hasJoined && players.find(p => p.name === playerName && p.id === hostId) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={startGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-8 px-16 rounded-2xl text-6xl mt-12 transition-all duration-300"
                >
                  Spiel starten
                </motion.button>
              )}
            </>
          )}
  
          {gameStarted && (
            <>
              <h1 className="text-9xl font-extrabold mb-10">Deine Rolle:</h1>
              <motion.div
                className="bg-blue-300 p-20 rounded-2xl text-7xl font-bold mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {myRole || "Wird geladen..."}
              </motion.div>
  
              <div className="mt-16">
                <h3 className="text-7xl mb-12">Wähle den Imposter:</h3>
                {players.map((player) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={player.id}
                    onClick={() => vote(player.name)}
                    disabled={votedPlayer !== ""}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-6 px-12 rounded-2xl text-5xl m-6 transition-all duration-300"
                  >
                    {player.name}
                  </motion.button>
                ))}
              </div>
  
              {votedPlayer && (
                <div className="mt-16 text-center">
                  <h4 className="text-6xl mb-6">Du hast abgestimmt für: {votedPlayer}</h4>
                  <p className="text-5xl mb-8 animate-pulse">Voting läuft...</p>
                  <div className="w-full bg-white rounded-full h-10 mt-6">
                    <div
                      className="bg-green-500 h-10 rounded-full"
                      style={{
                        width: `${(votesCount / players.length) * 100}%`,
                        transition: "width 0.5s ease-in-out"
                      }}
                    ></div>
                  </div>
                  <p className="text-5xl mt-6">{votesCount}/{players.length} Stimmen abgegeben</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}  