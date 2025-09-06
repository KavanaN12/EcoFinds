import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_USERS = 'eco_users_v1';
const LS_PRODUCTS = 'eco_products_v1';

export default function Cart({ auth, setAuth }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const nav = useNavigate();

  // Load cart
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

  // Remove item
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

  // Open modal for checkout
  const openCheckoutModal = (item) => {
    setSelectedItem(item);
    setShippingAddress("");
    setShowModal(true);
  };

  // Get current location
  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
        setShippingAddress(loc);
      },
      () => alert("Unable to fetch location")
    );
  };

  // Finalize checkout
  const confirmBuyNow = () => {
    if (!shippingAddress.trim()) {
      alert("Please enter shipping address!");
      return;
    }

    const item = selectedItem;
    const paymentType = paymentMethods[item.id];
    const status = paymentType === "Card" ? "Paid" : "Pending";

    processCheckout(item, status, shippingAddress);
    setShowModal(false);
  };

  // Process checkout
  const processCheckout = (item, status, address) => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const idx = users.findIndex(u => u.email === auth.email);
    if (idx === -1) return;

    const user = users[idx];
    user.orders = user.orders || [];

    const newOrder = {
      id: 'order_' + Date.now(),
      product: item,
      status,
      paymentMethod: paymentMethods[item.id],
      date: new Date().toISOString().split('T')[0],
      shippingAddress: address,
      owner: item.owner || ''
    };
    user.orders.push(newOrder);

    const gained = 5;
    user.ecoPoints = (user.ecoPoints || 0) + gained;
    user.transactions = (user.transactions || 0) + 1;

    user.cart = (user.cart || []).filter(p => p.id !== item.id);

    users.splice(idx, 1, user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));

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
                  <button className="btn small" onClick={() => openCheckoutModal(item)}>
                    {paymentMethods[item.id] === "Card" ? "Pay Now" : "Checkout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:20 }}>
        <strong>Total: ₹ {total}</strong>
      </div>

      {/* Floating Checkout Modal */}
      {showModal && selectedItem && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            width: "90%",
            maxWidth: 400
          }}>
            <h3>Shipping Details</h3>
            <p>For: <strong>{selectedItem.title}</strong></p>
            <textarea
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your shipping address"
              style={{ width: "100%", marginTop: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <button
              onClick={fillCurrentLocation}
              style={{ marginTop: 8, background: "orange", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
            >
              Use Current Location
            </button>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #aaa", background: "#eee", cursor: "pointer" }}
              >
                Back
              </button>
              <button
                onClick={confirmBuyNow}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "green", color: "#fff", cursor: "pointer" }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
