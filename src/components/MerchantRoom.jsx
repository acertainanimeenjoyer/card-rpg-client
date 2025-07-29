import React from 'react';

export default function MerchantRoom({ room, gold, onPurchase, onLeave }) {
  // room.inventory = [{ item, price }, …]
  return (
    <div className="room merchant-room">
      <h2>🛒 Merchant</h2>
      <p>Your Gold: {gold}</p>
      <ul>
        {room.inventory.map((stock, i) => (
          <li key={i}>
            {stock.item} — {stock.price} g
            <button
              disabled={gold < stock.price}
              onClick={() => onPurchase(stock.price, stock.item)}
            >
              Buy
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onLeave}>🚪 Leave Shop</button>
    </div>
  );
}
