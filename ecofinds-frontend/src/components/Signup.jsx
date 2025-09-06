import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';
const LS_AUTH = 'eco_auth_v1';

export default function Signup({ setAuth }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [preference, setPreference] = useState('');
  const [sector, setSector] = useState('');
  const nav = useNavigate();
  const [err, setErr] = useState('');

  function handleSignup(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    if (users.find(u => u.email === email)) {
      setErr('Email already registered.');
      return;
    }
    const newUser = {
      fullName,
      email,
      username,
      password,
      phone,
      address,
      gender,
      preference,
      sector,
      ecoPoints: 0,
      badges: [],
      transactions: 0,
      cart: [],
      purchases: []
    };
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
        <label>Full Name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} required />

        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />

        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />

        <label>Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" required />

        <label>Address</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)} required />

        <label>Gender</label>
        <select value={gender} onChange={e => setGender(e.target.value)} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Preference</label>
        <input value={preference} onChange={e => setPreference(e.target.value)} placeholder="e.g., eco-friendly products" required />

        <label>Sector of Working</label>
        <input value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g., IT, Manufacturing" required />

        <button className="btn" type="submit">Create Account</button>
      </form>
    </div>
  );
}
