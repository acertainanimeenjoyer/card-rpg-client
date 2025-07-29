import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Login failed.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error, please make sure the server is running.');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <p style={{ marginTop: '10px', color: '#ccc' }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: '#4fb0c6' }}>Register here</Link>
        </p>
      </form>
    </div>
  );
}
