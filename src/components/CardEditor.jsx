import React, { useState } from 'react';
import './CardEditor.css';

export default function CardEditor({ onAddCard }) {
  const [card, setCard] = useState({
    name: '',
    type: 'Attack',
    scaling: 'Physical',
    potency: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCard(card);
    setCard({ name: '', type: 'Attack', scaling: 'Physical', potency: 0 });
  };

  return (
    <form className="card-editor" onSubmit={handleSubmit}>
      <h3>🎨 Create New Card</h3>
      <input name="name" value={card.name} onChange={handleChange} placeholder="Card Name" required />
      <select name="type" value={card.type} onChange={handleChange}>
        <option value="Attack">Attack</option>
        <option value="Buff">Buff</option>
      </select>
      <select name="scaling" value={card.scaling} onChange={handleChange}>
        <option value="Physical">Physical</option>
        <option value="Supernatural">Supernatural</option>
        <option value="">None</option>
      </select>
      <input
        name="potency"
        type="number"
        value={card.potency}
        onChange={handleChange}
        placeholder="Potency"
        min="0"
      />
      <button type="submit">➕ Add Card</button>
    </form>
  );
}
