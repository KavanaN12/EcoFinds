import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';
const LS_AUTH = 'eco_auth_v1';

export default function Signup({ setAuth }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const [err, setErr] = useState('');

  function handleSignup(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    if (users.find(u => u.email === email)) {
      setErr('Email already registered.');
      return;
    }
    const newUser = { email, username, password, ecoPoints: 0, badges: [], transactions: 0, cart: [], purchases: [] };
    users.push(newUser);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_AUTH, JSON.stringify({ email, username }));
    setAuth({ email, username });
    nav('/');
  }

  return (
    <div className="card auth-card">
      <h2>Sign Up</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSignup}>
        <label>Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} required />
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button className="btn" type="submit">Create account</button>
      </form>
    </div>
  );
}
