import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';

export default function Cart({ auth, setAuth }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    if (!auth) {
      setCart([]);
      return;
    }
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find(u => u.email === auth.email);
    const c = user?.cart || [];
    setCart(c);
    setTotal(c.reduce((s, it) => s + (it.price || 0), 0));
  }, [auth]);

  function removeItem(id) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;
    const user = users[idx];
    user.cart = (user.cart || []).filter(i => i.id !== id);
    users.splice(idx,1,user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    setCart(user.cart);
    setTotal(user.cart.reduce((s, it) => s + (it.price || 0), 0));
  }

  function handleCheckout() {
    if (!auth) { nav('/login'); return; }
    // Move cart to purchases, clear cart, award points
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;
    const user = users[idx];
    user.purchases = user.purchases || [];
    user.purchases = [...user.purchases, ...(user.cart || [])];
    // award points: 5 points per item purchased
    const gained = (user.cart || []).length * 5;
    user.ecoPoints = (user.ecoPoints || 0) + gained;
    user.transactions = (user.transactions || 0) + (user.cart || []).length;
    user.cart = [];
    users.splice(idx,1,user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    // also remove purchased items from global products (simulate sale)
    const prods = JSON.parse(localStorage.getItem('eco_products_v1') || '[]');
    const purchasedIds = user.purchases.slice(- (user.transactions)).map(p=>p.id); // best effort
    const remaining = prods.filter(p => !purchasedIds.includes(p.id));
    localStorage.setItem('eco_products_v1', JSON.stringify(remaining));
    // update auth username in header (points may have changed)
    setAuth({ email: user.email, username: user.username });
    alert(`Checkout complete! You earned ${gained} EcoPoints.`);
    nav('/previous');
  }

  if (!auth) return <div className="card">Please <a href="/login">login</a> to view cart.</div>;

  return (
    <div className="container">
      <h2>Your Cart</h2>
      <div className="grid">
        {cart.map(item => (
          <div className="card" key={item.id}>
            <div style={{display:'flex', gap:12}}>
              <div style={{width:80,height:80,background:'#eee',display:'flex',alignItems:'center',justifyContent:'center'}}>{item.image ? <img src={item.image} alt="" style={{maxWidth:80,maxHeight:80}}/> : 'Image'}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{item.title}</div>
                <div>₹ {item.price}</div>
                <div style={{marginTop:8}}>
                  <button className="btn small ghost" onClick={()=>removeItem(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {cart.length === 0 && <div className="card">Cart is empty.</div>}
      </div>

      <div style={{marginTop:20}}>
        <strong>Total: ₹ {total}</strong>
        <div style={{marginTop:8}}>
          <button onClick={handleCheckout} className="btn" disabled={cart.length===0}>Checkout</button>
        </div>
      </div>
    </div>
  );
}
