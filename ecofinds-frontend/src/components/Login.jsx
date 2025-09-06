import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';
const LS_AUTH = 'eco_auth_v1';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      setErr('Invalid credentials. Try demo@eco.com / demo');
      return;
    }
    const auth = { email: user.email, username: user.username };
    localStorage.setItem(LS_AUTH, JSON.stringify(auth));
    setAuth(auth);
    nav('/');
  }

  return (
    <div className="card auth-card">
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button className="btn" type="submit">Login</button>
      </form>
      <p>New? <Link to="/signup">Create account</Link></p>
      <div className="hint">Demo account: demo@eco.com / demo</div>
    </div>
  );
}
