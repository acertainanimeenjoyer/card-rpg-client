import React from 'react';

export default function LootRoom({ room, onCollect }) {
  // room.lootTable = [{ item, amount }, …]
  return (
    <div className="room loot-room">
      <h2>🏺 Loot Room</h2>
      <ul>
        {room.lootTable.map((loot, i) => (
          <li key={i}>{loot.amount}× {loot.item}</li>
        ))}
      </ul>
      <button onClick={() => onCollect(room.lootTable)}>
        🗝️ Collect Loot
      </button>
    </div>
  );
}
