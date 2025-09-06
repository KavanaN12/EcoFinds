import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';

export default function Leaderboard() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const sorted = users.slice().sort((a,b) => (b.ecoPoints || 0) - (a.ecoPoints || 0));
    setTop(sorted.slice(0,10));
  }, []);

  return (
    <div className="container">
      <h2>EcoFinds Leaderboard</h2>
      <div className="card">
        <ol>
          {top.map((u, idx) => (
            <li key={u.email} style={{marginBottom:8}}>
              <strong>{u.username}</strong> — {u.ecoPoints || 0} pts {idx === 0 && <span className="badge">EcoSaver of the Month 🏆</span>}
            </li>
          ))}
        </ol>
        {top.length === 0 && <div>No users yet.</div>}
      </div>
    </div>
  );
}
