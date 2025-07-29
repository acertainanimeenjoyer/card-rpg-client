import React from 'react';

export default function EventRoom({ room, onResolve }) {
  // room.description = string
  return (
    <div className="room event-room">
      <h2>❓ Event</h2>
      <p>{room.description}</p>
      <button onClick={onResolve}>Continue</button>
    </div>
  );
}
