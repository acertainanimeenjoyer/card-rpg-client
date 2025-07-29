// client/src/pages/GamePage.jsx

import React, { useState, useEffect } from 'react';
import { playTurn as playTurnAPI } from '../services/gameService';
import { getDefaultCampaign } from '../services/campaignService';
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
  // ——— Player & Game State ———
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
    _id: "1234567890abcdef",
    name: "Shadow Fiend",
    hp: 300,
    imageUrl: "https://via.placeholder.com/150",
    stats: { physicalPower: 4, supernaturalPower: 6, speed: 2 }
  });

  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);

  // ——— UI & Control State ———
  const [initiative, setInitiative] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [playLocked, setPlayLocked] = useState(false);
  const [enemyWasHit, setEnemyWasHit] = useState(false);
  const [playerWasHit, setPlayerWasHit] = useState(false);

  // ——— Campaign State ———
  const [campaign, setCampaign] = useState([]);
  const [roomIndex, setRoomIndex] = useState(0);

  // ——— Initialize Deck ———
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

  // ——— Fetch Default Campaign ———
  useEffect(() => {
    (async () => {
      try {
        const { campaign: rooms } = await getDefaultCampaign(8);
        setCampaign(rooms);
      } catch (err) {
        console.error('Failed to load campaign:', err);
      }
    })();
  }, []);

  // ——— Campaign Navigation ———
  const advanceRoom = () => {
    if (roomIndex < campaign.length - 1) {
      setRoomIndex(roomIndex + 1);
    } else {
      alert("🏁 You've completed the default campaign!");
    }
  };

  // ——— Core Turn Logic ———
  const handlePlayTurn = async () => {
    if (gameOver || playLocked || (selectedCards.length === 0 && !selectedCards.some(c => c.name === 'Guard'))) {
      return;
    }
    setPlayLocked(true);

    try {
      const result = await playTurnAPI(selectedCards, playerStats, enemy._id);
      setInitiative(result.result.initiative);

      const enemyHP = result.result.enemy.hpRemaining;
      const playerHP = result.result.player.hpRemaining;
      const damageDealt = result.result.enemy.damageTaken;
      const damageReceived = result.result.player.damageTaken;

      alert(
        `You dealt ${damageDealt} damage!\nEnemy HP: ${enemyHP}\n\n` +
        `Enemy hit back for ${damageReceived}!\nYour HP: ${playerHP}`
      );

      // Flash hit animations
      setEnemyWasHit(true);
      setPlayerWasHit(true);
      setTimeout(() => {
        setEnemyWasHit(false);
        setPlayerWasHit(false);
      }, 400);

      // Update HP state
      setEnemy(prev => ({ ...prev, hp: enemyHP }));
      setPlayerStats(prev => ({
        ...prev,
        currentHp: Math.min(playerHP, prev.vitality * 100)
      }));

      // Check for victory/defeat
      if (enemyHP <= 0) {
        setGameOver(true);
        alert("🎉 Victory!");
        advanceRoom();                // ← Next room on victory
        return;
      }
      if (playerHP <= 0) {
        setGameOver(true);
        alert("💀 Defeat");
        return;
      }

      // Discard used cards
      setDiscardPile(prev => [...prev, ...selectedCards]);

      // Draw next hand (reshuffle if needed)
      let nextDeck = deck;
      let nextHand = [];
      if (deck.length < 3) {
        const reshuffled = shuffle([...deck, ...discardPile]);
        nextHand = reshuffled.slice(0, 3);
        nextDeck = reshuffled.slice(3);
        setDiscardPile([]);
      } else {
        nextHand = deck.slice(0, 3);
        nextDeck = deck.slice(3);
      }
      setHand(nextHand);
      setDeck(nextDeck);
      setSelectedCards([]);
    } catch (err) {
      console.error(err);
      alert("⚠️ Turn resolution failed.");
    } finally {
      setPlayLocked(false);
    }
  };

  // ——— Defend & Skip Actions ———
  const handleDefend = async () => {
    setSelectedCards([{ name: 'Guard', type: 'Buff', potency: 0 }]);
    await handlePlayTurn();
  };
  const handleSkipTurn = async () => {
    setSelectedCards([]);
    await handlePlayTurn();
  };

  // ——— Save & Load ———
  const handleSaveGame = async () => {
    try {
      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerStats, enemy, deck, hand, selectedCards, discardPile })
      });
      const data = await res.json();
      alert(data.message || "Game saved.");
    } catch {
      alert("⚠️ Save failed.");
    }
  };
  const handleLoadGame = async () => {
    try {
      const res = await fetch('/api/game/load');
      const data = await res.json();
      setPlayerStats(data.playerStats);
      setEnemy(data.enemy);
      setDeck(data.deck);
      setHand(data.hand);
      setDiscardPile(data.discardPile || []);
      setSelectedCards(data.selectedCards || []);
      setGameOver(false);
      alert("Game loaded!");
    } catch {
      alert("⚠️ Load failed.");
    }
  };

  // ——— Render ———
  const currentRoom = campaign[roomIndex] || {};
  const { type: roomType = 'loading', boss } = currentRoom;

  return (
    <div className="game-page">
      {/* Room Header */}
      <h2 style={{ textAlign: 'center' }}>
        Room {roomIndex + 1}/{campaign.length}: {boss ? 'Boss' : roomType.toUpperCase()}
      </h2>

      {/* Panels */}
      <EnemyPanel enemy={enemy} wasHit={enemyWasHit} />
      <PlayerPanel stats={playerStats} wasHit={playerWasHit} />

      {/* Initiative */}
      <h3 style={{ textAlign: 'center' }}>
        Initiative:{' '}
        <span style={{ color: initiative === 'player' ? 'green' : 'red' }}>
          {initiative === 'player' ? 'You act first!' : 'Enemy acts first!'}
        </span>
      </h3>

      {/* Deck / Discard Info */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        🃏 Deck: {deck.length} &nbsp;&nbsp; 🗑️ Discard: {discardPile.length}
      </div>

      {/* Card Hand */}
      <div className="card-hand">
        {hand.map((card, idx) => {
          const isSelected = selectedCards.includes(card);
          return (
            <div
              key={idx}
              className={`card-slot ${isSelected ? 'selected' : ''}`}
              title={`Type: ${card.type} | Potency: ${card.potency} ${card.scaling || ''}`}
              onClick={() => {
                setSelectedCards(prev =>
                  isSelected ? prev.filter(c => c !== card) : [...prev, card]
                );
              }}
            >
              <CardDisplay card={card} />
            </div>
          );
        })}
      </div>

      {/* Card Editor */}
      <CardEditor onAddCard={newCard => setDeck(prev => [...prev, newCard])} />

      {/* Action Buttons */}
      <ActionButtons
        onPlayTurn={handlePlayTurn}
        onDefend={handleDefend}
        onSkipTurn={handleSkipTurn}
        disabled={
          gameOver ||
          playLocked ||
          (selectedCards.length === 0 && !selectedCards.some(c => c.name === 'Guard'))
        }
      />

      {/* Save / Load / Restart */}
      <button onClick={handleSaveGame}>💾 Save Game</button>
      <button onClick={handleLoadGame}>📥 Load Game</button>
      {gameOver && <button onClick={() => window.location.reload()}>🔄 Restart Game</button>}
    </div>
  );
}
