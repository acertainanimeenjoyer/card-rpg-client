import React, { useState } from 'react';
import { registerUser } from '../services/authService';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { token } = await registerUser(username, password);
      localStorage.setItem('token', token);
      setMsg('✅ Registered successfully! You may now play.');
    } catch (err) {
      setMsg('❌ Registration failed.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
