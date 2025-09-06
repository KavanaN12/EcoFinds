import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';
const LS_PRODUCTS = 'eco_products_v1';

export default function Cart({ auth, setAuth }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState({});
  const nav = useNavigate();

  // Load cart and initialize payment methods
  useEffect(() => {
    if (!auth) {
      setCart([]);
      return;
    }

    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find(u => u.email === auth.email);
    const c = user?.cart || [];
    setCart(c);
    setTotal(c.reduce((sum, item) => sum + (item.price || 0), 0));

    const pm = {};
    c.forEach(item => { pm[item.id] = 'COD'; });
    setPaymentMethods(pm);
  }, [auth]);

  // Remove item from cart
  const removeItem = (id) => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;

    const user = users[idx];
    user.cart = (user.cart || []).filter(i => i.id !== id);
    users.splice(idx, 1, user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));

    setCart(user.cart);
    setTotal(user.cart.reduce((sum, item) => sum + (item.price || 0), 0));
  };

  // For COD: checkout immediately
  const handleCheckoutProduct = (item) => {
    if (!auth) { nav('/login'); return; }

    if (paymentMethods[item.id] === "Card") {
      // Card requires Pay Now
      alert(`Please click "Pay Now" to complete payment for "${item.title}"`);
      return;
    }

    processCheckout(item, "Pending"); // COD: status Pending
  };

  // For Card: process Pay Now
  const handlePayNow = (item) => {
    processCheckout(item, "Paid");
  };

  // Common checkout process
  const processCheckout = (item, status) => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;

    const user = users[idx];

    // Create new order
    user.orders = user.orders || [];
    const newOrder = {
      id: 'order_' + Date.now(),
      product: item,
      status: status,
      paymentMethod: paymentMethods[item.id],
      date: new Date().toISOString().split('T')[0],
      owner: item.owner || ''
    };
    user.orders.push(newOrder);

    // Award points
    const gained = 5;
    user.ecoPoints = (user.ecoPoints || 0) + gained;
    user.transactions = (user.transactions || 0) + 1;

    // Remove from cart
    user.cart = (user.cart || []).filter(p => p.id !== item.id);

    users.splice(idx, 1, user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));

    // Remove purchased item from global products
    const prods = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    const remaining = prods.filter(p => p.id !== item.id);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(remaining));

    setCart(user.cart);
    setTotal(user.cart.reduce((sum, it) => sum + (it.price || 0), 0));
    setAuth({ email: user.email, username: user.username });

    if (status === "Paid") {
      alert(`Checkout complete! Payment successful for "${item.title}". You earned ${gained} EcoPoints.`);
    } else {
      alert(`Checkout complete! You earned ${gained} EcoPoints for "${item.title}".`);
    }
  };

  if (!auth) return <div className="card">Please <a href="/login">login</a> to view cart.</div>;

  return (
    <div className="container">
      <h2>Your Cart</h2>
      <div className="grid">
        {cart.length === 0 && <div className="card">Cart is empty.</div>}

        {cart.map(item => (
          <div className="card" key={item.id}>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ width:80, height:80, background:'#eee', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {item.image ? <img src={item.image} alt="" style={{ maxWidth:80, maxHeight:80 }}/> : 'Image'}
              </div>

              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{item.title}</div>
                <div>₹ {item.price}</div>

                <div style={{ marginTop:8 }}>
                  <label>
                    Payment: 
                    <select
                      value={paymentMethods[item.id]}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, [item.id]: e.target.value })}
                      style={{ marginLeft:6 }}
                    >
                      <option value="COD">Cash on Delivery</option>
                      <option value="Card">Card</option>
                    </select>
                  </label>
                </div>

                <div style={{ marginTop:8, display:'flex', gap:6 }}>
                  <button className="btn small ghost" onClick={() => removeItem(item.id)}>Remove</button>

                  {paymentMethods[item.id] === "Card" ? (
                    <button className="btn small" onClick={() => handlePayNow(item)}>Pay Now</button>
                  ) : (
                    <button className="btn small" onClick={() => handleCheckoutProduct(item)}>Checkout</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:20 }}>
        <strong>Total: ₹ {total}</strong>
      </div>
    </div>
  );
}
