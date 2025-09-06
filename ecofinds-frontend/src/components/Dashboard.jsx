import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';

function badgeForPoints(points = 0) {
  if (points >= 200) return 'EcoSaver 🏆';
  if (points >= 100) return 'Eco Warrior 🌍';
  if (points >= 50) return 'Eco Beginner 🌱';
  return 'Newcomer';
}

export default function Dashboard({ auth, setAuth }) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // form states for editing
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    address: '',
    gender: '',
    preference: '',
    sector: ''
  });

  useEffect(() => {
    if (!auth) return;
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const u = users.find(x => x.email === auth.email);
    setUser(u);
    setForm({
      username: u?.username || '',
      fullName: u?.fullName || '',
      phone: u?.phone || '',
      address: u?.address || '',
      gender: u?.gender || '',
      preference: u?.preference || '',
      sector: u?.sector || ''
    });
  }, [auth]);

  function save() {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;

    users[idx] = { ...users[idx], ...form }; // merge updated fields
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

        {/* Profile */}
        <div className="dash-card">
          <h4>Profile</h4>
          {editMode ? (
            <>
              <label>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />

              <label>Full Name</label>
              <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />

              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

              <label>Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

              <label>Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <label>Preference</label>
              <input value={form.preference} onChange={e => setForm({ ...form, preference: e.target.value })} />

              <label>Sector</label>
              <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />

              <div style={{ marginTop: 8 }}>
                <button className="btn" onClick={save}>Save</button>
                <button className="btn ghost" onClick={() => setEditMode(false)} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p><strong>{user?.fullName || user?.username}</strong></p>
              <p>{user?.email}</p>
              <p>{user?.phone}</p>
              <button className="btn small" onClick={() => setEditMode(true)}>Edit</button>
            </>
          )}
        </div>

        {/* EcoPoints */}
        <div className="dash-card">
          <h4>EcoPoints</h4>
          <p style={{ fontSize: 22, fontWeight: 700 }}>{user?.ecoPoints || 0} pts</p>
          <p>Badges: {user?.badges?.length ? user.badges.join(', ') : badgeForPoints(user?.ecoPoints)}</p>
          <div style={{ marginTop: 8 }}>
            <div className="progress">
              <div className="progress-bar" style={{ width: Math.min((user?.ecoPoints || 0), 200) / 2 + '%' }} />
            </div>
            <small>Points progress toward EcoSaver</small>
          </div>
        </div>

        {/* Transactions */}
        <div className="dash-card">
          <h4>Transactions</h4>
          <p>Items bought: {user?.purchases?.length || 0}</p>
          <p>Listings: {(() => {
            const prods = JSON.parse(localStorage.getItem('eco_products_v1') || '[]');
            return prods.filter(p => p.owner === auth.email).length;
          })()}</p>
        </div>

        {/* Impact */}
        <div className="dash-card" style={{ height: 200, display: "flex", flexDirection: "column" }}>
          <h4>Impact</h4>

          <div style={{ flex: 1, overflowY: "auto", marginTop: 6 }}>
            <p>CO₂ saved (est): {(user?.ecoPoints || 0) * 0.1} kg</p>
            <p>Waste diverted: {(user?.ecoPoints || 0) * 0.02} kg</p>
            <p>Community Influence: {Math.floor((user?.ecoPoints || 0) / 20)} people</p>
            <p>Recycling Contributions: {Math.floor((user?.ecoPoints || 0) / 10)} items</p>
            <p>Trees Equivalent: {((user?.ecoPoints || 0) / 100).toFixed(2)} trees saved</p>

            {/* Sustainability contributions from purchased products */}
            {user?.purchases?.length > 0 && (
              <>
                <strong style={{ display: "block", marginTop: 8 }}>Your Contributions:</strong>
                <ul>
                  {user.purchases.map((prod, idx) => (
                    <li key={idx}>{prod.contribution}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
