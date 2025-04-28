import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { db } from "./firebaseConfig";
import { ref, set, push, onValue, update, get } from "firebase/database";
import BACKGROUND_MUSIC_URL from "./Lofi.mp3";
import ChatBox from "./ChatBox"; // oder wo du sie speicherst
import MusicPlayer from "./MusicPlayer";


// Anime-Charaktere (bereits vorhanden)
const animeCharacters = [
"Naruto Uzumaki", "Sasuke Uchiha", "Sakura", "Kakashi Hatake",
"Luffy", "Roronoa Zoro", "Nami", "Sanji",
"Goku", "Vegeta", "Piccolo", "Gohan", "Frieza",
"Light Yagami", "Ryuk", "Edward Elric", "L",
"Ichigo Kurosaki", "Uryu Ishida", "Orihime Inoue",
"Saitama", "Genos", "Tatsumaki", "Mumen Rider",
"Levi Ackerman", "Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Erwin Smith",
"Rem", "Emilia", "Subaru Natsuki", "Natsu Dragneel",
"Kirito", "Asuna", "Zero Two", "Ken Kaneki", "Itachi Uchiha", "Gaara", "Hinata Hyuga",
"All Might", "Bakugo Katsuki", "Shanks", "Usopp", "Trafalgar Law", "Jiraiya",
"Nezuko", "Tanjiro", "Zenitsu Agatsuma", "Inosuke Hashibira",
"Giyu Tomioka", "Kanao Tsuyuri", "Saber", "Gilgamesh", "Askeladd",
"Killua Zoldyck", "Gon Freecss", "Hisoka", "Denji",
"Alphonse Elric", "Greed", "Kurapika", "Thorfinn", "Gintoki",
"Gojo Satoru", "Yuji Itadori", "Megumi Fushiguro"
];

// Allgemeinwissen (neu)
const generalKnowledgeItems = [
"Einstein", "Newton", "Galileo", "Tesla", "Shakespeare", "Mozart", "Beethoven", "Napoleon", "Caesar", "Cleopatra", 
"Aristoteles", "Sokrates", "Goethe", "Mittelalter", "Antike", "Neuzeit", "Revolution", "Demokratie", "Kommunismus",
"Kapitalismus", "Monarchie", "Imperium", "Kolonie", "Internet", "Computer", "Druckerpresse", "Fernseher",
"Zelle", "Atom", "Molekul", "Gravitation", "Evolution", "Photosynthese", "Elektrizitat", "Magnetismus",
"Relativitat", "Quantenphysik", "Biologie", "Chemie", "Physik", "Mathematik", "Astronomie", "Medizin",
"Kunst", "Literatur", "Philosophie", "Architektur", "Musik", "Oper", "Ballett", "Theater", 
"Zuckerberg", "Obama", "Merkel", "Trump", "Biden", "Drake", "Adele", "Rihanna", "Beyonce",
"Blockchain", "Bitcoin", "Impfung", "Genetik", "Mars", "Elektroauto", "Solar", "Windkraft", 
"Fusion", "Recycling", "Nachhaltig", "Handy", "Streaming", "Podcast", "Drohne", "Satellit", "KI", "Algorithmus", 
"Datenschutz", "Quanten", "Cyber", "Biotech", "Medien", "Digital", "Streetart", "Youtube", "Tiktok",
"Influencer", "Follower", "Hashtag", "Gaming", "Esport", "Streaming", "Livestream", 
"App", "Download", "Upload", "Passwort", "Emoji", "Meme", "Chatbot",
"Virtual", "Avatar", "Content", "Creator", "Trend", "Like", "Share",
"Selfie", "Story", "Post", "Blog", "Vlog", "Mensch", "Kind", "Frau", 
"Mann", "Baby", "Familie", "Freund", "Tier","Hund", "Katze", "Vogel", "Fisch", "Auto", "Buch", "Stuhl", "Tisch",
"Tür", "Fenster", "Haus", "Bett", "Lampe", "Baum", "Blume", "Wiese",
"Apfel", "Brot", "Milch", "Wasser", "Saft", "Tee", "Kaffee", "Schokolade",
"Ball", "Puppe", "Zug", "Bus", "Flugzeug", "Fahrrad", "Straße", "Weg",
"Hand", "Fuß", "Kopf", "Auge", "Ohr", "Nase", "Mund", "Haar",
"Sonne", "Mond", "Stern", "Wolke", "Regen", "Schnee", "Wind", "Feuer",
"Tag", "Nacht", "Morgen", "Abend", "Sommer", "Winter", "Herbst", "Frühling",
"Freude", "Lachen", "Weinen", "Liebe", "Hoffnung", "Angst", "Mut", "Glück",
"Buchstabe", "Wort", "Bild", "Ton", "Lied", "Spiel", "Arbeit", "Pause", "Stadion",
"Zeit", "Stunde", "Minute", "Sekunde", "Jahr", "Tag", "Woche", "Monat", "Pyramide", "Vape"
];

// Geographie (neu)
const geographyItems = [
"Deutschland", "Frankreich", "Italien", "Spanien", "England",
"USA", "Kanada", "Mexiko", "Brasilien", "Argentinien",
"China", "Japan", "Indien", "Australien", "Russland",
"Ägypten", "Südafrika", "Nigeria", "Marokko",
"Norwegen", "Schweden", "Finnland", "Dänemark", "Polen",
"Österreich", "Schweiz", "Niederlande", "Belgien", "Portugal",
"Griechenland", "Türkei", "Thailand", "Vietnam", "Indonesien",
"Iran", "Irak", "Israel", "Chile", "Amazonas", "Berg", "Landschaft",
"Peru", "Kolumbien", "Venezuela", "Neuseeland", "Philippinen",
"Tokio", "NewYork", "London", "Paris", "Peking", "Ufer",
"Berlin", "Hamburg", "München", "Rom", "Madrid", "Wasserfall",
"Toronto", "Chicago", "Boston", "Miami", "LosAngeles", "Erdrutsch",
"Shanghai", "Seoul", "Bangkok", "Mumbai", "Kapstadt", "Lawine",
"Kairo", "Jakarta", "Athen", "Wüste", "Regenwald", "Wald", "Nordpol", "Südpol",
"Wien", "Prag", "Budapest", "Oslo", "Stockholm",
"Zürich", "Genf", "Brüssel", "Lissabon", "Helsinki",
"Nil", "Amazonas", "Donau", "BigBen", "Ulm", "Korallenriff", 
"Rhein", "Elbe", "Kongo", "TajMahal", "Eiffelturm", "Colosseum", "Tundra"
];

// Marken (neu)
const brandItems = [
 "Apple", "Microsoft", "Google", "Amazon", "Facebook",
"CocaCola", "Pepsi", "Fanta", "Sprite", "DrPepper",
"Nike", "Adidas", "Puma", "Reebok", "UnderArmour",
"Mercedes", "BMW", "Audi", "Volkswagen", "Porsche",
"McDonalds", "Subway", "KFC", "PizzaHut", "Starbucks",
"Samsung", "Sony", "LG", "Panasonic", "Philips",
"LEGO", "Mattel", "Hasbro", "Nintendo", "PlayStation",
"Chanel", "Gucci", "LouisVuitton", "Prada", "Versace",
"Disney", "Netflix", "Spotify", "YouTube",
"IKEA", "HM", "Zara", "Uniqlo", "Nike",
"TikTok", "Snapchat", "Twitter", "Reddit", "Pinterest",
"Intel", "AMD", "Dell", "HP", "Lenovo",
"Ford", "Toyota", "Honda", "Hyundai", "Kia",
"Visa", "Mastercard", "PayPal", "Uber",
"eBay", "Shopify", "Zoom", "Slack", "Dropbox",
"Canon", "Nikon", "GoPro", "DJI", "Fitbit",
"Rolex", "BurgerKing", "Dominos", "Dunkin", "Chipotle",
"Xbox", "Tesla", "Boeing", "Airbus", "Bosch",
"Siemens", "Shell", "Zara", "Nestle", "Kelloggs", 
"Nutella", "Nestle", "Gillette", "OralB", "Dove", "Nivea",
"Loreal", "Adidas", "Pampers", "Lego", "Spotify",
"Marvel", "Pixar", "Playboy", "TikTok", "YouTube"
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
  const [shouldStartNewGame, setShouldStartNewGame] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Neue Zustände für die Imposter-Erraten-Funktionalität
  const [imposterGuess, setImposterGuess] = useState("");
  const [commonRole, setCommonRole] = useState("");
  const [imposterGuessed, setImposterGuessed] = useState(false);
  const [imposterWon, setImposterWon] = useState(false);
  const [gameEndReason, setGameEndReason] = useState(""); // "imposterGuess", "voting"

  function returnToHome() {
    setHasJoined(false);
    setRoomCode("");
    setJoinRoomCode("");
    setPlayers([]);
    setPlayerName("");
    setGameStarted(false);
    setSelectedTheme(0);
    setRoomTheme(0);
    setShowResults(false);
    setWinner("");
    setVotedPlayer("");
    setImposterGuess("");
    setImposterGuessed(false);
    setImposterWon(false);
    setGameEndReason("");
    setImposterName("");
  }
  
  useEffect(() => {
    if (!hasJoined) {
      document.body.style.overflow = "hidden"; // Kein Scrollen auf der Startseite
    } else {
      document.body.style.overflow = "auto"; // Wieder normales Scrollen im Spiel
    }
  
    // Clean up wenn Component unmountet wird
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [hasJoined]);

  useEffect(() => {
    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
  
      const unsubscribeRoom = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setHostId(data.hostId);
          setGameStarted(data.gameStarted);
          setRoomTheme(data.themeIndex ?? 0);
          setCommonRole(data.commonRole ?? "");
          setImposterGuessed(data.imposterGuessed ?? false);
          setImposterWon(data.imposterWon ?? false);
          setGameEndReason(data.gameEndReason ?? "");
          setImposterName(data.imposterName ?? ""); // NEU hinzugefügt!
  
          if (!data.gameStarted && data.imposterGuessed) {
            setShowResults(true);
          }
        }
      });
  
      return () => unsubscribeRoom();
    }
  }, [roomCode]);

  useEffect(() => {
    if (countdown === 0) {
      setShouldStartNewGame(true);   // Flag setzen
    }
  }, [countdown]);
  
  useEffect(() => {
    if (
      shouldStartNewGame &&
      hostId &&
      players.length > 0 &&
      players.find(p => p.name === playerName && p.id === hostId)
    ) {
      setShouldStartNewGame(false); // Wichtig: Flag wieder auf false setzen
      setTimeout(() => {
        startNewGame(); // Jetzt wirklich starten
      }, 1000); // 1 Sekunde Verzögerung
    }
  }, [shouldStartNewGame, hostId, players, playerName]);


  useEffect(() => {
    if (gameStarted && showResults) {
      setShowResults(false);
      setCountdown(5);
      setWinner("");
    }
  }, [gameStarted]);
  

  useEffect(() => {
    if (roomCode) {
      const playersRef = ref(db, `rooms/${roomCode}/players`);
  
      const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(Object.values(data));  // wichtig: als Array speichern
        } else {
          setPlayers([]); // keine Spieler -> leeres Array
        }
      });
  
      return () => unsubscribePlayers();
    }
  }, [roomCode]);
  
  

  useEffect(() => {
    if (gameStarted && roomCode) {
      const votesRef = ref(db, `rooms/${roomCode}/votes`);
      const playersRef = ref(db, `rooms/${roomCode}/players`);
  
      const unsubscribeVotes = onValue(votesRef, (snapshot) => {
        const votesData = snapshot.val();
      
        get(playersRef).then(playersSnapshot => {
          const playersData = playersSnapshot.val();
          const playerCount = playersData ? Object.keys(playersData).length : 0;
          const totalVotes = votesData ? Object.keys(votesData).length : 0;
      
          setVotesCount(totalVotes);
      
          if (totalVotes >= playerCount && !showResults && !imposterGuessed) {
            const voteCounts = {};
            Object.values(votesData).forEach((votedName) => {
              voteCounts[votedName] = (voteCounts[votedName] || 0) + 1;
            });
      
            const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
            if (sortedVotes.length > 0) {
              setWinner(sortedVotes[0][0]);
            }
      
            const imposter = Object.values(playersData).find(p => p.role === "Imposter");

            let realImposterName = "";
            if (imposter) {
              realImposterName = imposter.name;
            }
            
            const imposterWasFound = sortedVotes.length > 0 && sortedVotes[0][0] === realImposterName;
            
            // JETZT updaten
            update(ref(db, `rooms/${roomCode}`), {
              gameStarted: false,
              imposterWon: !imposterWasFound,
              gameEndReason: "voting",
              imposterName: realImposterName   // <-- WICHTIG: den echten Imposter speichern!
            });
            
            // Danach im State aktualisieren:
            setImposterName(realImposterName);
            
      
            setShowResults(true);
          }
        });
      });
      
  
      return () => unsubscribeVotes();
    }
  }, [gameStarted, roomCode, showResults, imposterGuessed]);
  


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
      setImposterGuess("");
      setImposterGuessed(false);
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
      players: {},
      gameStarted: false,
      votes: {},
      hostId: null,
      themeIndex: 0,
      imposterGuessed: false,
      imposterWon: false,
      gameEndReason: "",
      imposterName: "", // <-- NEU hinzugefügt
      commonRole: "" // <-- NEU hinzugefügt
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
    if (playerName && roomCode && !hasJoined) {  // ← Entferne die Prüfung auf players.length hier!
      const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
      const playersData = playersSnapshot.val() || {};
  
      if (Object.keys(playersData).length >= 8) {
        setErrorMessage("Raum voll! Maximal 8 Spieler.");
        return;
      }
  
      const playerRef = push(ref(db, `rooms/${roomCode}/players`));
      await set(playerRef, { name: playerName, id: playerRef.key });
  
      if (Object.keys(playersData).length === 0) {
        await update(ref(db, `rooms/${roomCode}`), { hostId: playerRef.key });
      }
  
      setHasJoined(true);
      setErrorMessage("");
    }
  }
  

  async function changeTheme(themeIndex) {
    if (roomCode && hostId && players.find(p => p.name === playerName && p.id === hostId)) {
      await update(ref(db, `rooms/${roomCode}`), { themeIndex: themeIndex });
      setSelectedTheme(themeIndex);
    }
  }



  async function startGame() {
    if (!roomCode) return;
  
    const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
    const playersData = playersSnapshot.val();
    const playerList = playersData ? Object.values(playersData) : [];
  
    if (!playerList.length) return;
  
    setStartingPlayer(Math.floor(Math.random() * playerList.length));
    const imposterIndex = Math.floor(Math.random() * playerList.length);
    const imposterPlayer = playerList[imposterIndex];
  
    const themeItems = themes[roomTheme].items;
    const selectedRole = themeItems[Math.floor(Math.random() * themeItems.length)];
  
    const updates = {};
  
    playerList.forEach((player) => {
      updates[`rooms/${roomCode}/players/${player.id}/role`] =
        player.id === imposterPlayer.id ? "Imposter" : selectedRole;
    });
  
    updates[`rooms/${roomCode}/commonRole`] = selectedRole;
    updates[`rooms/${roomCode}/imposterName`] = imposterPlayer.name;
    updates[`rooms/${roomCode}/imposterGuessed`] = false;
    updates[`rooms/${roomCode}/imposterWon`] = false;
    updates[`rooms/${roomCode}/gameEndReason`] = "";
    updates[`rooms/${roomCode}/votes`] = {};
  
    // 🛠️ Erst ALLES speichern (außer gameStarted)
    await update(ref(db), updates);
  
    // ✅ Danach separat: gameStarted setzen
    await update(ref(db, `rooms/${roomCode}`), {
      gameStarted: true
    });
  }
  
  
  
  async function startNewGame() {
    if (!roomCode) return;
  
    const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
    const playersData = playersSnapshot.val();
    const playerList = playersData ? Object.values(playersData) : [];
  
    if (!playerList.length) return;
  
    const imposterIndex = Math.floor(Math.random() * playerList.length);
    const imposterPlayer = playerList[imposterIndex];
    const themeItems = themes[roomTheme].items;
    const selectedRole = themeItems[Math.floor(Math.random() * themeItems.length)];
  
    const updates = {};
  
    playerList.forEach((player) => {
      updates[`rooms/${roomCode}/players/${player.id}/role`] =
        player.id === imposterPlayer.id ? "Imposter" : selectedRole;
    });
  
    updates[`rooms/${roomCode}/commonRole`] = selectedRole;
    updates[`rooms/${roomCode}/imposterName`] = imposterPlayer.name;
    updates[`rooms/${roomCode}/imposterGuessed`] = false;
    updates[`rooms/${roomCode}/imposterWon`] = false;
    updates[`rooms/${roomCode}/gameEndReason`] = "";
    updates[`rooms/${roomCode}/votes`] = {};
  
    // ❌ NICHT gameStarted hier schon auf true setzen!
  
    await update(ref(db), updates);
  
    // ✅ Jetzt NACHDEM alles geschrieben wurde, "gameStarted" true setzen!
    await update(ref(db, `rooms/${roomCode}`), {
      gameStarted: true
    });
  
    setShowResults(false);
    setVotedPlayer("");
    setVotesCount(0);
    setImposterGuess("");
    setImposterGuessed(false);
    setImposterWon(false);
    setGameEndReason("");
  }
  

  async function vote(name) {
    // Prüfen, ob der Spieler nicht sich selbst wählt
    if (name === playerName) {
      return; // Selbst-Voting verhindern
    }
    
    if (roomCode && !votedPlayer && !imposterGuessed) {
      const voteRef = ref(db, `rooms/${roomCode}/votes/${playerName}`);
      await set(voteRef, name);
      setVotedPlayer(name);
    }
  }

  async function submitImposterGuess() {
    if (myRole === "Imposter" && !imposterGuessed && roomCode) {
      const isCorrect = commonRole
  .toLowerCase()
  .split(" ")
  .some(word => word === imposterGuess.trim().toLowerCase());

      
      // Markiere, dass der Imposter geraten hat
      await update(ref(db, `rooms/${roomCode}`), { 
        imposterGuessed: true,
        imposterWon: isCorrect,
        gameStarted: false,
        gameEndReason: "imposterGuess"
      });
      
      // Zeige die Ergebnisse
      const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
      const playersData = playersSnapshot.val();
      
      if (playersData) {
        const imposter = Object.values(playersData).find(p => p.role === "Imposter");
        if (imposter) {
          setImposterName(imposter.name);
        }
      }
      
      setShowResults(true);
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

  const imposterGuessBoxStyle = {
    backgroundColor: "#ff3366",
    padding: "30px",
    borderRadius: "15px",
    marginTop: "30px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
    width: "100%",
    maxWidth: "800px",
    textAlign: "center",
    marginLeft: "auto",    // NEU
    marginRight: "auto"    // NEU
  };
  
  

  // Stil für den Imposter-Input
const imposterInputStyle = {
  display: "block",        // Neu
  margin: "20px auto",     // Neu: Zentrieren
  padding: "15px",
  fontSize: "32px",
  width: "70%",
  borderRadius: "12px",
  border: "none",
  color: "black"
};


  // Stil für den Imposter-Submit-Button
  const imposterSubmitButtonStyle = {
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
    width: "50%",
    transition: "background-color 0.3s ease"
  };


  return (
    <div style={mainContainerStyle}>
      <SimpleQuestionMarksBackground />

      <div style={{
  position: "fixed",
  top: "60px",
  left: "60px",
  zIndex: 200,
  cursor: "pointer",
  fontSize: "70px",
  color: "white"
}} onClick={() => setShowHelp(true)}>
  ❓
</div>

{showHelp && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300
  }}>
    <div style={{
      backgroundColor: "white",
      color: "black",
      padding: "30px",
      borderRadius: "15px",
      width: "100%",
      maxWidth: "700px",
      textAlign: "center",
      position: "relative"
    }}>
      <h3 style={{ marginBottom: "20px" }}>Wie funktioniert das Spiel?</h3>
      <p style={{ fontSize: "30px", marginBottom: "20px", fontWeight: "500", fontFamily: "monospace", whiteSpace: "pre-line" }}>
        Alle Spieler bekommen ein gemeinsames Wort.<br /> 
        Ein Spieler ist der Imposter und kennt das Wort nicht.<br /> 
        <br />
        Ihr müsst euch gegenseitig Fragen stellen, um herauszufinden, wer der Imposter ist.<br />
        Der Imposter muss versuchen, so zu tun, als wüsste er das Wort!<br />
        <br />
        Der Imposter gewinnt das Spiel wenn er das richtige Wort eintippt, oder wenn er nicht von der Mehrheit gevotet wird.<br />
      </p>
      <button
        onClick={() => setShowHelp(false)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "22px",
          backgroundColor: "#ff3366",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Schließen
      </button>
    </div>
  </div>
)}


      <MusicPlayer />
      <ChatBox roomCode={roomCode} playerName={playerName} />
  
      {showResults ? (
        <div style={{ marginTop: "80px", textAlign: "center" }}>
          <h2 style={{ fontSize: "72px", marginBottom: "40px", fontWeight: "bold" }}>Ergebnisse</h2>
  
          {gameEndReason === "imposterGuess" ? (
            <>
              <p style={{ fontSize: "60px", marginBottom: "30px" }}>
                Der Imposter <span style={{ fontWeight: "bold", color: "#ff3366" }}>{imposterName}</span> hat
                {imposterWon ? " das Wort richtig erraten!" : " das Wort falsch erraten!"}
              </p>
              <p style={{ fontSize: "48px", marginBottom: "30px" }}>
                Das richtige Wort war: <span style={{ fontWeight: "bold" }}>{commonRole}</span>
              </p>
              <p style={{ fontSize: "60px", marginBottom: "30px", color: imposterWon ? "#ff3366" : "#4caf50", fontWeight: "bold" }}>
                {imposterWon ? "Der Imposter hat gewonnen!" : "Der Imposter hat verloren!"}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: "60px", marginBottom: "30px" }}>Am meisten Votes: <span style={{ fontWeight: "bold" }}>{winner}</span></p>
              <p style={{ fontSize: "60px", marginBottom: "30px" }}>
                Der Imposter war: <span style={{ fontWeight: "bold", color: "#ff3366" }}>{imposterName}</span>
              </p>
              <p style={{ fontSize: "48px", marginBottom: "30px" }}>
                Das richtige Wort war: <span style={{ fontWeight: "bold" }}>{commonRole}</span>
              </p>
              <p style={{ fontSize: "60px", marginBottom: "30px", color: imposterWon ? "#ff3366" : "#4caf50", fontWeight: "bold" }}>
                {imposterWon ? "Der Imposter hat gewonnen!" : "Der Imposter hat verloren!"}
              </p>
            </>
          )}
  
          <p style={{ fontSize: "48px", marginBottom: "30px" }}>Neues Spiel in {countdown} Sekunden...</p>
        </div>
      ) : !hasJoined ? (
        <>
          <h1 style={{ ...titleStyle, cursor: "pointer" }} onClick={returnToHome} > Imposter Game </h1>

  
          {!roomCode ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <button
                onClick={createRoom}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  fontWeight: "bold",
                  padding: "20px 40px",
                  fontSize: "36px",
                  borderRadius: "15px",
                  border: "none",
                  marginTop: "90px",
                  marginBottom: "180px",
                  cursor: "pointer",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#27902b"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
              >
                ➕ Neuen Raum erstellen
              </button>
  
              <input
                type="text"
                placeholder="Raum-Code eingeben"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                style={{
                  padding: "15px",
                  fontSize: "32px",
                  width: "60%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "none",
                  textAlign: "center",
                  color: "black"
                }}
              />
  
              <button
                onClick={joinExistingRoom}
                style={{
                  backgroundColor: "#39c2ff",
                  color: "white",
                  fontWeight: "bold",
                  padding: "15px 30px",
                  fontSize: "32px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#279cd0"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#39c2ff"}
              >
                Raum beitreten
              </button>
  
              {errorMessage && (
                <p style={{ color: "#ff3366", fontSize: "28px", marginTop: "20px" }}>
                  {errorMessage}
                </p>
              )}
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "48px", marginBottom: "20px" }}>Raum-Code:</h2>
              <CopyToClipboard text={roomCode} />
  
              <input
              type="text"
              placeholder="Dein Name"
              value={playerName}
              onChange={(e) => {
              if (e.target.value.length <= 12) {
              setPlayerName(e.target.value);
                }
              }}
              maxLength={10}
              style={{
              padding: "15px",
              fontSize: "32px",
              width: "30%",
              borderRadius: "12px",
              margin: "20px 0",
               border: "none",
              color: "black"
              }}
            />

  
              <button
                onClick={joinRoom}
                disabled={!playerName.trim()}
                style={{
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
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#279cd0"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#39c2ff"}
              >
                Beitreten
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <h1 style={{ ...titleStyle, cursor: "pointer" }} onClick={returnToHome}> Imposter Game </h1>
          <h2 style={{ fontSize: "48px", marginBottom: "20px" }}>Raum-Code: {roomCode}</h2>

          <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "40px", borderRadius: "15px", width: "100%", maxWidth: "1000px", marginTop: "20px" }}>
            <h3 style={{ fontSize: "42px", marginBottom: "20px" }}>Spieler ({players.length}/8):</h3>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
              {players.map((player) => (
                <div key={player.id} style={{ padding: "15px 25px", backgroundColor: player.id === hostId ? "#ff3366" : "#39c2ff", borderRadius: "10px", fontWeight: "bold", display: "flex", alignItems: "center", fontSize: "28px" }}>
                  {player.name}
                  {player.id === hostId && (
                    <span style={{ marginLeft: "10px", fontSize: "22px" }}>👑</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {hostId && players.find(p => p.name === playerName && p.id === hostId) && !gameStarted && (
            <>
              <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "40px", borderRadius: "15px", width: "100%", maxWidth: "1000px", marginTop: "30px" }}>
                <h3 style={{ fontSize: "42px", marginBottom: "20px" }}>Thema wählen:</h3>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
                  {themes.map((theme, index) => (
                    <button
                      key={index}
                      style={roomTheme === index ? selectedThemeButtonStyle : themeButtonStyle}
                      onClick={() => changeTheme(index)}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                style={{ ...buttonStyle, marginTop: "40px", backgroundColor: "#ff3366", width: "50%" }}
                onClick={startGame}
                disabled={players.length < 3}
              >
                Spiel starten
              </button>
              {players.length < 3 && (
                <p style={{ color: "#ff3366", fontSize: "28px", marginTop: "10px" }}>
                  Mindestens 3 Spieler werden benötigt!
                </p>
              )}
            </>
          )}

          {gameStarted && (
            <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "40px", borderRadius: "15px", width: "100%", maxWidth: "1000px", marginTop: "30px", textAlign: "center" }}>
              <h3 style={{ fontSize: "42px", marginBottom: "30px" }}>Dein Wort:</h3>
              <p style={{ fontSize: "60px", fontWeight: "bold", color: myRole === "Imposter" ? "#ff3366" : "#39c2ff" }}>
                {myRole === "Imposter" ? "Du bist der Imposter!" : myRole}
              </p>
              <p style={{ fontSize: "32px", marginTop: "30px" }}>Spieler {players[startingPlayer]?.name} beginnt!</p>

              {myRole === "Imposter" && !imposterGuessed && (
                <div style={imposterGuessBoxStyle}>
                  <input
                    style={imposterInputStyle}
                    type="text"
                    placeholder="Deine Vermutung..."
                    value={imposterGuess}
                    onChange={(e) => setImposterGuess(e.target.value)}
                  />
                  <button
                    style={imposterSubmitButtonStyle}
                    onClick={submitImposterGuess}
                    disabled={!imposterGuess.trim()}
                  >
                    Erraten
                  </button>
                </div>
              )}

              {!votedPlayer && !imposterGuessed && (
                <>
                  <h3 style={{ fontSize: "36px", marginTop: "40px", marginBottom: "20px" }}>Abstimmung:</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px", marginBottom: "20px" }}>
                    {players.map((player) => (
                      <button
                        key={player.id}
                        style={{ ...themeButtonStyle, backgroundColor: player.name === playerName ? "#666" : "#39c2ff", opacity: player.name === playerName ? 0.5 : 1, cursor: player.name === playerName ? "not-allowed" : "pointer" }}
                        onClick={() => vote(player.name)}
                        disabled={player.name === playerName}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {votedPlayer && (
                <p style={{ fontSize: "32px", marginTop: "20px" }}>
                  Du hast für <span style={{ fontWeight: "bold" }}>{votedPlayer}</span> gestimmt.
                </p>
              )}

              <p style={{ fontSize: "28px", marginTop: "20px" }}>Stimmen abgegeben: {votesCount}/{players.length}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}