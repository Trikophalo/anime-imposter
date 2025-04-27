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

  function createRoom() {
    const newRoomCode = uuidv4().slice(0, 5).toUpperCase();
    setRoomCode(newRoomCode);
    set(ref(db, `rooms/${newRoomCode}`), {
      players: [],
      gameStarted: false,
      votes: {},
      hostId: null
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
    await update(ref(db, `rooms/${roomCode}`), { gameStarted: true });
  }

  function vote(name) {
    if (roomCode) {
      const voteRef = ref(db, `rooms/${roomCode}/votes/${name}`);
      set(voteRef, (votes[name] || 0) + 1);
      setVotedPlayer(name);
    }
  }

  return ( ... ); // (Rest deines Codes bleibt unverändert)
}
