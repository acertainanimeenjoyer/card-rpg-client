// client/src/pages/MainMenu.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainMenu.css';

export default function MainMenu() {
  const token    = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="menu-page">
      <h1>⚔️ Card Rogue-Lite RPG</h1>

      {token ? (
        <>
          <div className="menu-profile">
            <span className="avatar">{username?.[0]?.toUpperCase()}</span>
            <span className="username">{username}</span>
          </div>
          <nav className="menu-nav">
            <Link to="/game"   className="menu-button">▶️ Start Game</Link>
            <Link to="/editor" className="menu-button">🖌️ Card Editor</Link>
            <button onClick={handleLogout} className="menu-button">🚪 Logout</button>
          </nav>
        </>
      ) : (
        <nav className="menu-nav">
          <Link to="/login"    className="menu-button">🔐 Login</Link>
          <Link to="/register" className="menu-button">✍️ Register</Link>
        </nav>
      )}
    </div>
  );
}
