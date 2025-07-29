import React from 'react';

export default function EnemyPanel({ enemy, wasHit }) {
  if (!enemy) return null;
  return (
    <div className={`panel ${wasHit ? 'hp-flash' : ''}`}>
      <h3>🧟 {enemy.name}</h3>
      <img src={enemy.imageUrl} alt="enemy" />
      <p>HP: {enemy.hp}</p>
      <ul>
        {Object.entries(enemy.stats).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
