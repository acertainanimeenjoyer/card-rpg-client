import React from 'react';
import './ActionButtons.css';

export default function ActionButtons({ onPlayTurn, onSkipTurn, onDefend, disabled }) {
  return (
    <div className="action-buttons">
      <button onClick={onPlayTurn} disabled={disabled}>▶️ Play Turn</button>
      <button onClick={onDefend} disabled={disabled}>🛡️ Defend</button>
      <button onClick={onSkipTurn} disabled={disabled}>⏭️ Skip Turn</button>
    </div>
  );
}
