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
    // eslint-disable-next-line
  }, [auth]);

  function loadOrders() {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const me = users.find(u => u.email === auth.email);
    setOrders(me?.orders || []);
  }

  // Buyer confirms Received (successful) or Not Received
  function confirmReceived(orderId, received) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const meIdx = users.findIndex(u => u.email === auth.email);
    if (meIdx === -1) return;
    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    if (received) {
      // open rating modal
      setRatingOrderId(orderId);
      setRatingValue(0);
    } else {
      // mark notReceived and set status Pending for buyer
      me.orders[orderIdx].notReceived = true;
      me.orders[orderIdx].status = "Pending";

      // also set in seller's data (if seller has the same order)
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
    if (meIdx === -1) return;
    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === ratingOrderId);
    if (orderIdx === -1) return;

    me.orders[orderIdx].rating = ratingValue;
    me.orders[orderIdx].rated = true;
    // remove any notReceived flag (if any)
    delete me.orders[orderIdx].notReceived;

    users.splice(meIdx, 1, me);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    setRatingOrderId(null);
    setRatingValue(0);
    loadOrders();
  }

  if (!auth) return <div className="card">Please <a href="/login">login</a> to view your orders.</div>;
  if (!orders || orders.length === 0) return <div className="card">No orders yet.</div>;

  const btnStyle = {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  };

  const successBtn = { ...btnStyle, background: "#16a34a", color: "white" };
  const notRecBtn = { ...btnStyle, background: "#dc2626", color: "white" };

  return (
    <div className="container">
      <h2>My Orders</h2>

      {orders.map(order => {
        // Only show the "you marked not received" remark while order.status === "Pending"
        const showNotReceivedRemark = !!order.notReceived && order.status === "Pending";

        return (
          <div key={order.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 80, height: 80, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                {order.product?.image ? <img src={order.product.image} alt="" style={{ maxWidth: 80, maxHeight: 80 }} /> : "Image"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{order.product?.title}</div>
                <div>Seller: {order.product?.owner}</div>
                <div>Price: ₹ {order.product?.price}</div>
                <div>Payment Method: {order.paymentMethod}</div>

                <div style={{ marginTop: 8 }}>
                  <strong>Status: </strong>
                  <span style={{
                    color: order.status === "Pending" ? "red" : "black",
                    fontWeight: order.status === "Pending" ? 700 : 500
                  }}>{order.status}</span>
                </div>

                {/* Estimated Delivery */}
                {order.status === "Shipping (Estimated Date)" && order.estimatedDate && (
                  <div style={{ marginTop: 6 }}>
                    <strong>Estimated Delivery:</strong> {order.estimatedDate}
                  </div>
                )}

                {/* Not Received remark while still pending */}
                {showNotReceivedRemark && (
                  <div style={{ color: "red", marginTop: 8, fontWeight: 600 }}>
                    ⚠️ You marked this order as Not Received
                  </div>
                )}

                {/* Delivered: show buttons only when not rated and not currently marked notReceived */}
                {order.status === "Delivered" && !order.rated && !showNotReceivedRemark && (
                  <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                    <button style={successBtn} onClick={() => confirmReceived(order.id, true)}>Successful</button>
                    <button style={notRecBtn} onClick={() => confirmReceived(order.id, false)}>Not Received</button>
                  </div>
                )}

                {/* Already rated */}
                {order.rated && (
                  <div style={{ marginTop: 8 }}>
                    ⭐ Your Rating: {order.rating}/5
                  </div>
                )}
              </div>
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
                    background: ratingValue === n ? "#16a34a" : "#f3f4f6",
                    color: ratingValue === n ? "white" : "black",
                    cursor: "pointer"
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={submitRating} style={{ ...btnStyle, background: "#2563eb", color: "white" }}>Submit</button>
              <button onClick={() => { setRatingOrderId(null); setRatingValue(0); }} style={{ ...btnStyle, background: "#eee" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
