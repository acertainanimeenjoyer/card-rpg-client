import React, { useEffect, useState } from 'react';
import './CardDisplay.css';

export default function CardDisplay({ card }) {
  const [playAnimation, setPlayAnimation] = useState(false);

  useEffect(() => {
    setPlayAnimation(true);
    const timeout = setTimeout(() => {
      setPlayAnimation(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [card]);

  return (
    <div className={`card ${card.type.toLowerCase()} ${playAnimation ? 'card-animate' : ''}`}>
      <h3 className="card-title">{card.name}</h3>

      <p className="card-type">{card.type}</p>

      {card.potency > 0 && (
        <p className="card-potency">Potency: {card.potency}</p>
      )}

      {card.scaling && (
        <p className="card-scaling">Scaling: {card.scaling}</p>
      )}
    </div>
  );
}
