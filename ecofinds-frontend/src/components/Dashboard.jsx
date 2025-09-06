import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';

function badgeForPoints(points=0) {
  if (points >= 200) return 'EcoSaver 🏆';
  if (points >= 100) return 'Eco Warrior 🌍';
  if (points >= 50) return 'Eco Beginner 🌱';
  return 'Newcomer';
}

export default function Dashboard({ auth, setAuth }) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!auth) return;
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const u = users.find(x => x.email === auth.email);
    setUser(u);
    setUsername(u?.username || '');
  }, [auth]);

  function save() {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;
    users[idx].username = username;
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    setUser(users[idx]);
    setAuth({ email: users[idx].email, username: users[idx].username });
    setEditMode(false);
  }

  if (!auth) return <div className="card">Login to view dashboard.</div>;

  return (
    <div className="card dashboard-card">
      <h2>Dashboard</h2>
      <div className="dash-grid">
        <div className="dash-card">
          <h4>Profile</h4>
          {editMode ? (
            <>
              <label>Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} />
              <div style={{marginTop:8}}>
                <button className="btn" onClick={save}>Save</button>
                <button className="btn ghost" onClick={()=>setEditMode(false)} style={{marginLeft:8}}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p><strong>{user?.username}</strong></p>
              <p>{user?.email}</p>
              <button className="btn small" onClick={()=>setEditMode(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="dash-card">
          <h4>EcoPoints</h4>
          <p style={{fontSize:22,fontWeight:700}}>{user?.ecoPoints || 0} pts</p>
          <p>Badges: {user?.badges?.length ? user.badges.join(', ') : badgeForPoints(user?.ecoPoints)}</p>
          <div style={{marginTop:8}}>
            <div className="progress">
              <div className="progress-bar" style={{width: Math.min((user?.ecoPoints || 0),200) / 2 + '%'}} />
            </div>
            <small>Points progress toward EcoSaver</small>
          </div>
        </div>

        <div className="dash-card">
          <h4>Transactions</h4>
          <p>Items bought: {user?.purchases?.length || 0}</p>
          <p>Listings: { /* count owned products */ (() => {
            const prods = JSON.parse(localStorage.getItem('eco_products_v1') || '[]');
            return prods.filter(p => p.owner === auth.email).length;
          })()}</p>
        </div>

        <div className="dash-card">
          <h4>Impact</h4>
          {/* simple dummy impact calculation */}
          <p>CO₂ saved (est): {(user?.ecoPoints || 0) * 0.1} kg</p>
          <p>Waste diverted: {(user?.ecoPoints || 0) * 0.02} kg</p>
        </div>
      </div>
    </div>
  );
}
