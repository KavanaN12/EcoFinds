import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';
const STATUS_OPTIONS = ["Waiting for Production", "Paid", "Shipping (Estimated Date)", "Ready in Remote", "Delivered", "Pending"];

export default function MyOrders({ auth }) {
  const [orders, setOrders] = useState([]);
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    if (!auth) return;
    loadOrders();
  }, [auth]);

  function loadOrders() {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const me = users.find(u => u.email === auth.email);
    setOrders(me?.orders || []);
  }

  function confirmReceived(orderId, received) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const meIdx = users.findIndex(u => u.email === auth.email);
    if (meIdx === -1) return;
    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    if (received) {
      setRatingOrderId(orderId);
      setRatingValue(0);
    } else {
      me.orders[orderIdx].notReceived = true;
      me.orders[orderIdx].status = "Pending";

      const sellerEmail = me.orders[orderIdx].product.owner;
      const sellerIdx = users.findIndex(u => u.email === sellerEmail);
      if (sellerIdx !== -1) {
        const seller = users[sellerIdx];
        if (Array.isArray(seller.orders)) {
          const sOrder = seller.orders.find(o => o.id === orderId);
          if (sOrder) {
            sOrder.notReceived = true;
            sOrder.status = "Pending";
          }
        }
        users.splice(sellerIdx, 1, seller);
      }
    }

    users.splice(meIdx, 1, me);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  }

  function submitRating() {
    if (!ratingOrderId || ratingValue < 1) {
      alert("Select a rating 1-5");
      return;
    }
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const meIdx = users.findIndex(u => u.email === auth.email);
    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === ratingOrderId);

    me.orders[orderIdx].rating = ratingValue;
    me.orders[orderIdx].rated = true;
    delete me.orders[orderIdx].notReceived;

    users.splice(meIdx, 1, me);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    setRatingOrderId(null);
    setRatingValue(0);
    loadOrders();
  }

  if (!auth) return <div className="card" style={{ padding: 20 }}>Please <a href="/login">login</a> to view your orders.</div>;
  if (!orders || orders.length === 0) return <div className="card" style={{ padding: 20 }}>No orders yet.</div>;

  const btnStyle = { padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer" };
  const successBtn = { ...btnStyle, background: "#333", color: "white" };
  const notRecBtn = { ...btnStyle, background: "#999", color: "white" };

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "20px 0" }}>
      <h2 style={{ marginBottom: 20 }}>My Orders</h2>

      {orders.map(order => {
        const showNotReceivedRemark = !!order.notReceived && order.status === "Pending";

        return (
          <div key={order.id} className="card" style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            alignItems: "center",
            backgroundColor: "#fff"
          }}>
            {/* Product Image */}
            <div style={{
              flex: "0 0 100px",
              height: 100,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {order.product?.image ? (
                <img
                  src={order.product.image}
                  alt={order.product.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 12, color: "#666" }}>No Image</span>
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{order.product?.title}</div>
              <div>Seller: {order.product?.owner}</div>
              <div>Price: ₹ {order.product?.price}</div>
              <div>Payment Method: {order.paymentMethod}</div>
              <div style={{ marginTop: 6 }}>
                <strong>Status: </strong>
                <span style={{ color: order.status === "Pending" ? "red" : "#000", fontWeight: order.status === "Pending" ? 700 : 500 }}>
                  {order.status}
                </span>
              </div>

              {order.status === "Shipping (Estimated Date)" && order.estimatedDate && (
                <div><strong>Estimated Delivery:</strong> {order.estimatedDate}</div>
              )}

              {showNotReceivedRemark && (
                <div style={{ color: "red", fontWeight: 600 }}>⚠️ You marked this order as Not Received</div>
              )}

              {order.status === "Delivered" && !order.rated && !showNotReceivedRemark && (
                <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                  <button style={successBtn} onClick={() => confirmReceived(order.id, true)}>Successful</button>
                  <button style={notRecBtn} onClick={() => confirmReceived(order.id, false)}>Not Received</button>
                </div>
              )}

              {order.rated && <div style={{ marginTop: 6 }}>⭐ Your Rating: {order.rating}/5</div>}
            </div>
          </div>
        );
      })}

      {/* Rating modal */}
      {ratingOrderId && (
        <div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.5)",
          zIndex: 2000
        }}>
          <div style={{ background: "white", padding: 20, borderRadius: 8, width: 320 }}>
            <h3 style={{ marginTop: 0 }}>Rate this order</h3>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRatingValue(n)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    background: ratingValue === n ? "#333" : "#f0f0f0",
                    color: ratingValue === n ? "white" : "#000",
                    cursor: "pointer"
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={submitRating} style={{ ...btnStyle, background: "#333", color: "white" }}>Submit</button>
              <button onClick={() => { setRatingOrderId(null); setRatingValue(0); }} style={{ ...btnStyle, background: "#eee" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
