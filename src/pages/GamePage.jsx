// client/src/pages/GamePage.jsx

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { playTurnAPI } from '../services/gameService';
import { getDefaultCampaign } from '../services/campaignService';
import CardDisplay from '../components/CardDisplay';
import PlayerPanel from '../components/PlayerPanel';
import EnemyPanel from '../components/EnemyPanel';
import ActionButtons from '../components/ActionButtons';
import LootRoom from '../components/LootRoom';
import MerchantRoom from '../components/MerchantRoom';
import EventRoom from '../components/EventRoom';
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
  const [playerName] = useState(() => {
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

  const [enemy, setEnemy] = useState(null);

  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);        // use IDs

  // ——— UI & Control State ———
  const [initiative, setInitiative] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [playLocked, setPlayLocked] = useState(false);
  const [enemyWasHit, setEnemyWasHit] = useState(false);
  const [playerWasHit, setPlayerWasHit] = useState(false);

  // ——— Campaign State ———
  const [campaign, setCampaign] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [gold, setGold] = useState(0);

  // ——— Initialize Deck ———
  useEffect(() => {
    const initialDeck = [
      { id: uuidv4(), name: "Slash", potency: 20, type: "Attack", scaling: "Physical" },
      { id: uuidv4(), name: "Fireball", potency: 25, type: "Attack", scaling: "Supernatural" },
      { id: uuidv4(), name: "Guard", potency: 0, type: "Buff", scaling: null },
      { id: uuidv4(), name: "Stab", potency: 15, type: "Attack", scaling: "Physical" },
      { id: uuidv4(), name: "Flame Shield", potency: 0, type: "Buff", scaling: null },
      { id: uuidv4(), name: "Lightning Bolt", potency: 30, type: "Attack", scaling: "Supernatural" },
      { id: uuidv4(), name: "Punch", potency: 10, type: "Attack", scaling: "Physical" }
    ];
    const shuffled = shuffle(initialDeck);
    setHand(shuffled.slice(0, 3));
    setDeck(shuffled.slice(3));
  }, []);

  // ——— Fetch Default Campaign & First Enemy ———
  useEffect(() => {
    (async () => {
      try {
        const { campaign: rooms } = await getDefaultCampaign(8);
        setCampaign(rooms);

        // Adjust for your schema: use roomType and enemies[0]
        if (rooms[0].roomType === 'Attacker' && rooms[0].enemies && rooms[0].enemies[0]) {
          const e = await fetch(`/api/enemies/${rooms[0].enemies[0]}`).then(r => r.json());
          setEnemy(e);
        } else {
          setEnemy(null); // No enemy for non-combat rooms
        }
      } catch (err) {
        console.error('Failed to load campaign:', err);
      }
    })();
  }, []);

  // ——— Campaign Navigation ———
  const advanceRoom = async () => {
    if (roomIndex < campaign.length - 1) {
      const nextIdx = roomIndex + 1;
      setRoomIndex(nextIdx);

      const nextRoom = campaign[nextIdx];
      if (nextRoom.roomType === 'Attacker' && nextRoom.enemies && nextRoom.enemies[0]) {
        try {
          const e = await fetch(`/api/enemies/${nextRoom.enemies[0]}`).then(r => r.json());
          setEnemy(e);
        } catch (err) {
          console.error('Failed to load enemy:', err);
          setEnemy(null);
        }
      } else {
        setEnemy(null); // Clear enemy for non-combat rooms
      }
    } else {
      alert("🏁 You've completed the default campaign!");
    }
  };

  // ——— Core Turn Logic ———
  const handlePlayTurn = async () => {
      if (gameOver || playLocked || selectedIds.length === 0) return;
      if (!enemy || !enemy._id) {
        alert("No enemy loaded!");
        return;
      }
      setPlayLocked(true);
    // map IDs → card objects
    const toPlay = hand.filter(c => selectedIds.includes(c.id));
    if (toPlay.length === 0) {
      alert("No valid cards selected!");
      setPlayLocked(false);
      return;
    }
    try {
      const result = await playTurnAPI({
      selectedCards: toPlay,
      playerStats,
      enemyId: enemy?._id,
    });
      setInitiative(result.result.initiative);

      const enemyHP = result.result.enemy.hpRemaining;
      const playerHP = result.result.player.hpRemaining;
      const damageDealt = result.result.enemy.damageTaken;
      const damageReceived = result.result.player.damageTaken;

      alert(
        `You dealt ${damageDealt} damage!\nEnemy HP: ${enemyHP}\n\n` +
        `Enemy hit back for ${damageReceived}!\nYour HP: ${playerHP}`
      );

      // flash
      setEnemyWasHit(true);
      setPlayerWasHit(true);
      setTimeout(() => {
        setEnemyWasHit(false);
        setPlayerWasHit(false);
      }, 400);

      // update HP
      setEnemy(prev => ({ ...prev, hp: enemyHP }));
      setPlayerStats(prev => ({
        ...prev,
        currentHp: Math.min(playerHP, prev.vitality * 100)
      }));

      // check end
      if (enemyHP <= 0) {
        setGameOver(true);
        alert("🎉 Victory!");
        advanceRoom();
        return;
      }
      if (playerHP <= 0) {
        setGameOver(true);
        alert("💀 Defeat");
        return;
      }

      // DISCARD by id
      setDiscardPile(d => [...d, ...toPlay]);

      // REMOVE from deck by id, then draw
      let remaining = deck.filter(c => !selectedIds.includes(c.id));
      let nextHand = [];
      if (remaining.length < 3) {
        const reshuffled = shuffle([...remaining, ...discardPile]);
        nextHand = reshuffled.slice(0, 3);
        remaining = reshuffled.slice(3);
        setDiscardPile([]);
      } else {
        nextHand = remaining.slice(0, 3);
        remaining = remaining.slice(3);
      }
      setHand(nextHand);
      setDeck(remaining);
      setSelectedIds([]);

    } catch (err) {
      console.error("🔴 Turn failed:", err);
      alert("⚠️ Turn failed.");
    } finally {
      setPlayLocked(false);
    }
  };

  // ——— Defend & Skip ———
  const handleDefend = async () => {
    const guardCard = [...hand, ...deck].find(c => c.name === 'Guard');
    if (guardCard) setSelectedIds([guardCard.id]);
    await handlePlayTurn();
  };
  const handleSkipTurn = async () => {
    setSelectedIds([]);
    await handlePlayTurn();
  };

  // ——— Save & Load ———
  const handleSaveGame = async () => {
    try {
      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerStats, enemy, deck, hand, selectedIds, discardPile, campaign, roomIndex, gold })
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
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = await res.json();

      // restore or fallback
      setPlayerStats(data.playerStats || playerStats);
      setEnemy(data.enemy || enemy);
      setDeck(Array.isArray(data.deck) ? data.deck : []);
      setHand(Array.isArray(data.hand) ? data.hand : []);
      setDiscardPile(Array.isArray(data.discardPile) ? data.discardPile : []);
      setSelectedIds(Array.isArray(data.selectedIds) ? data.selectedIds : []);
      setCampaign(Array.isArray(data.campaign) ? data.campaign : campaign);
      setRoomIndex(typeof data.roomIndex === 'number' ? data.roomIndex : 0);
      setGold(typeof data.gold === 'number' ? data.gold : 0);
      setGameOver(false);
      alert('🎉 Game loaded!');
    } catch (err) {
      console.error('🔴 Load failed:', err);
      alert('⚠️ Load failed.');
    }
  };

  // ——— Render Guards ———
  if (!campaign) return <div className="game-page">Loading campaign…</div>;
  if (!Array.isArray(deck) || !Array.isArray(discardPile))
    return <div className="game-page">Loading game state…</div>;

  // ——— Room Branching ———
  const currentRoom = campaign[roomIndex] || {};
  const { type: roomType = 'combat', boss } = currentRoom;

  if (roomType === 'loot') {
    return (
      <LootRoom
        room={currentRoom}
        onCollect={(items) => {
          const gained = items
            .filter(l => l.item === 'Gold')
            .reduce((sum, l) => sum + l.amount, 0);
          setGold(g => g + gained);
          advanceRoom();
        }}
      />
    );
  }
  if (roomType === 'merchant') {
    return (
      <MerchantRoom
        room={currentRoom}
        gold={gold}
        onPurchase={p => setGold(g => g - p)}
        onLeave={advanceRoom}
      />
    );
  }
  if (roomType === 'event') {
    return <EventRoom room={currentRoom} onResolve={advanceRoom} />;
  }
  const normalizedRoomType = (roomType || '').toLowerCase();
  if (normalizedRoomType === 'attacker' && !enemy) {
    return <div>Loading enemy...</div>;
  }
  // ——— Combat UI ———
  return (
    <div className="game-page">
      <h2 style={{ textAlign: 'center' }}>
        Room {roomIndex + 1}/{campaign.length}: {boss ? 'Boss' : roomType.toUpperCase()}
      </h2>

      <EnemyPanel enemy={enemy} wasHit={enemyWasHit} />
      <PlayerPanel stats={playerStats} wasHit={playerWasHit} />

      <h3 style={{ textAlign: 'center' }}>
        Initiative:{' '}
        <span style={{ color: initiative === 'player' ? 'green' : 'red' }}>
          {initiative === 'player' ? 'You act first!' : 'Enemy acts first!'}
        </span>
      </h3>

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        🃏 Deck: {deck.length} &nbsp;&nbsp; 🗑️ Discard: {discardPile.length}
      </div>

      <div className="card-hand">
        {hand.map((c) => {
          const selected = selectedIds.includes(c.id);
          return (
            <div
              key={c.id}
              className={`card-slot ${selected ? 'selected' : ''}`}
              onClick={() =>
                setSelectedIds(ids =>
                  ids.includes(c.id)
                    ? ids.filter(x => x !== c.id)
                    : [...ids, c.id]
                )
              }
            >
              <CardDisplay card={c} />
            </div>
          );
        })}
      </div>

      <ActionButtons
        onPlayTurn={handlePlayTurn}
        onDefend={handleDefend}
        onSkipTurn={handleSkipTurn}
        disabled={gameOver || playLocked || selectedIds.length === 0}
      />

      <button onClick={handleSaveGame}>💾 Save Game</button>
      <button onClick={handleLoadGame}>📥 Load Game</button>
      {gameOver && (
        <button onClick={() => window.location.reload()}>🔄 Restart</button>
      )}
    </div>
  );
}
