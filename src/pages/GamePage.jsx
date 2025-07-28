import React, { useState, useEffect } from 'react';
import { playTurn as playTurnAPI } from '../services/gameService';
import CardDisplay from '../components/CardDisplay';
import PlayerPanel from '../components/PlayerPanel';
import EnemyPanel from '../components/EnemyPanel';
import ActionButtons from '../components/ActionButtons';
import CardEditor from '../components/CardEditor';
import './GamePage.css';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GamePage() {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("playerName") || prompt("Enter your hero's name:");
  });
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);
  const [playerStats, setPlayerStats] = useState({
    attackPower: 10,
    physicalPower: 5,
    supernaturalPower: 5,
    durability: 5,
    vitality: 3,
    intelligence: 2,
    speed: 3,
    currentHp: 300,
  });

  const [enemy, setEnemy] = useState({
    _id: "1234567890abcdef", // replace with real MongoDB ID
    name: "Shadow Fiend",
    hp: 300,
    imageUrl: "https://via.placeholder.com/150",
    stats: {
      physicalPower: 4,
      supernaturalPower: 6,
      speed: 2
    }
  });
  const [discardPile, setDiscardPile] = useState([]);
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [initiative, setInitiative] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [enemyWasHit, setEnemyWasHit] = useState(false);
  const [playerWasHit, setPlayerWasHit] = useState(false);
  const [playLocked, setPlayLocked] = useState(false);

  // 🃏 Initial deck setup
  useEffect(() => {
    const initialDeck = [
      { name: "Slash", potency: 20, type: "Attack", scaling: "Physical" },
      { name: "Fireball", potency: 25, type: "Attack", scaling: "Supernatural" },
      { name: "Guard", potency: 0, type: "Buff", scaling: null },
      { name: "Stab", potency: 15, type: "Attack", scaling: "Physical" },
      { name: "Flame Shield", potency: 0, type: "Buff", scaling: null },
      { name: "Lightning Bolt", potency: 30, type: "Attack", scaling: "Supernatural" },
      { name: "Punch", potency: 10, type: "Attack", scaling: "Physical" }
    ];

    const shuffled = shuffle(initialDeck);
    setHand(shuffled.slice(0, 3));
    setDeck(shuffled.slice(3));
  }, []);

  // 🎴 Play Turn
  const handlePlayTurn = async () => {
    try {
      const result = await playTurnAPI(selectedCards, playerStats, enemy._id);
      setInitiative(result.result.initiative);
      const enemyHP = result.result.enemy.hpRemaining;
      const playerHP = result.result.player.hpRemaining;

      alert(
        `You dealt ${result.result.enemy.damageTaken} damage!\nEnemy HP: ${enemyHP}\n\n` +
        `Enemy hit back for ${result.result.player.damageTaken}!\nYour HP: ${playerHP}`
      );

      setEnemyWasHit(true);
      setPlayerWasHit(true);
      setTimeout(() => {
        setEnemyWasHit(false);
        setPlayerWasHit(false);
      }, 400);


      setEnemy(prev => ({
        ...prev,
        hp: enemyHP
      }));

      setPlayerStats(prev => ({
        ...prev,
        currentHp: Math.min(playerHP, prev.vitality * 100)
      }));

      if (enemyHP <= 0) {
        setGameOver(true);
        alert("🎉 Victory!");
        return;
      }

      if (playerHP <= 0) {
        setGameOver(true);
        alert("💀 Defeat");
        return;
      }

      if (gameOver || selectedCards.length === 0 || playLocked) return;
        setPlayLocked(true);



      // 🃏 Draw next hand
      let nextDeck = deck;
      let nextHand = [];

      if (deck.length < 3) {
        const reshuffled = shuffle([...deck, ...discardPile]);
        nextHand = reshuffled.slice(0, 3);
        nextDeck = reshuffled.slice(3);
        setDiscardPile([]); // reset discard pile
      } else {
        nextHand = deck.slice(0, 3);
        nextDeck = deck.slice(3);
      }

      setHand(nextHand);
      setDeck(nextDeck);

      setSelectedCards([]);
      setDiscardPile(prev => [...prev, ...selectedCards]);
      setPlayLocked(false);

    } catch (err) {
      alert("⚠️ Turn resolution failed. Check connection or backend logic.");
      console.error(err);
    }
  };

  // 💾 Save Game
  const handleSaveGame = async () => {
    try {
      const response = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerStats,
          enemy,
          deck,
          hand,
          selectedCards
        })
      });

      const data = await response.json();
      alert(data.message || "Game saved.");
    } catch (err) {
      alert("Save failed.");
      console.error(err);
    }
  };
  const handleLoadGame = async () => {
    try {
        const response = await fetch('/api/game/load');
        const data = await response.json();

        setPlayerStats(data.playerStats);
        setEnemy(data.enemy);
        setDeck(data.deck);
        setHand(data.hand);
        setSelectedCards(data.selectedCards || []);
        alert("Game loaded!");
    }   catch (err) {
        alert("Failed to load game.");
        console.error(err);
    }
  };
  const handleDefend = async () => {
    setSelectedCards([{ name: 'Guard', type: 'Buff', potency: 0 }]);
    await handlePlayTurn(); // reuse play logic!
  };

  const handleSkipTurn = async () => {
    setSelectedCards([]);
    await handlePlayTurn(); // send empty hand
  };

  return (
    <div className="game-page">
      <EnemyPanel enemy={enemy} wasHit={enemyWasHit} />
      <PlayerPanel stats={playerStats} wasHit={playerWasHit} />
      <h3>{playerName}'s Stats</h3>
      <h3 style={{ textAlign: "center" }}>
        Initiative: <span style={{ color: initiative === 'player' ? 'green' : 'red' }}>
            {initiative === 'player' ? 'You act first!' : 'Enemy acts first!'}
        </span>
      </h3>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        🃏 Deck: {deck.length} &nbsp;&nbsp; 🗑️ Discard: {discardPile.length}
      </div>

      <div className="card-hand">
        {hand.map((card, i) => {
          const isSelected = selectedCards.includes(card);
          return (
            <div
              key={i}
              className={`card-slot ${isSelected ? "selected" : ""}`}
              onClick={() => {
                setSelectedCards(prev =>
                  isSelected
                    ? prev.filter(c => c !== card)
                    : [...prev, card]
                );
              }}
            >
              <CardDisplay card={card} />
            </div>
          );
        })}
      </div>
      <CardEditor onAddCard={(newCard) => setDeck(prev => [...prev, newCard])} />
      <ActionButtons
        onPlayTurn={handlePlayTurn}
        onDefend={handleDefend}
        onSkipTurn={handleSkipTurn}
        disabled={selectedCards.length === 0 || gameOver || playLocked}
      />
      <button onClick={handleSaveGame}>💾 Save Game</button>
      <button onClick={handleLoadGame}>📥 Load Game</button>
      {gameOver && (
        <button onClick={() => window.location.reload()}>🔄 Restart Game</button>
      )}
    </div>
  );
}
