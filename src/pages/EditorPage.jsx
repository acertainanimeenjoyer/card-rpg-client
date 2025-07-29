// client/src/pages/EditorPage.jsx

import React, { useState } from 'react';
import CardEditor from '../components/CardEditor';
import './EditorPage.css';

export default function EditorPage() {
  const [deck, setDeck] = useState([]);

  return (
    <div className="editor-page">
      <h2>🎨 Card Editor</h2>
      <CardEditor onAddCard={card => setDeck(prev => [...prev, card])} />
      <div className="editor-deck-list">
        <h3>Your Custom Cards</h3>
        <ul>
          {deck.map((card, idx) => (
            <li key={idx}>
              {card.name} — {card.type}
              {card.scaling ? `/${card.scaling}` : ''} (Potency: {card.potency})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
