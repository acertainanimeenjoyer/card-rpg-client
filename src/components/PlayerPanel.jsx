import React from 'react';

export default function PlayerPanel({ stats, wasHit }) {
  return (
    <div className={`panel ${wasHit ? 'hp-flash' : ''}`}>
      <h3>🧙‍♂️ Player</h3>
      <p>HP: {stats.currentHp}</p>
      <ul>
        {Object.entries(stats).map(([key, value]) => (
          key !== 'currentHp' && <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
