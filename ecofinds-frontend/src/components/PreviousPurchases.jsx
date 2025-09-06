import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';

export default function PreviousPurchases({ auth }) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    if (!auth) return;
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find(u => u.email === auth.email);
    setPurchases(user?.purchases || []);
  }, [auth]);

  if (!auth) return <div className="card">Please login to view purchases.</div>;

  return (
    <div className="container">
      <h2>Previous Purchases</h2>
      <div className="grid">
        {purchases.map(p => (
          <div className="card" key={p.id}>
            <div style={{fontWeight:600}}>{p.title}</div>
            <div>₹ {p.price}</div>
            <div>{p.category}</div>
          </div>
        ))}
        {purchases.length === 0 && <div className="card">No previous purchases.</div>}
      </div>
    </div>
  );
}
