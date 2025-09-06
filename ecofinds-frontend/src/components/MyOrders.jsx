import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';

export default function MyOrders({ auth }) {
  const [orders, setOrders] = useState([]);
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    if (!auth) return;
    loadOrders();
  }, [auth]);

  const loadOrders = () => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const me = users.find(u => u.email === auth.email);
    setOrders(me?.orders || []);
  };

  const confirmReceived = (orderId, received) => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const meIdx = users.findIndex(u => u.email === auth.email);
    if (meIdx === -1) return;

    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    if (received) {
      setRatingOrderId(orderId); // open rating modal
    } else {
      me.orders[orderIdx].notReceived = true;
      me.orders[orderIdx].status = "Pending";

      // reflect in seller
      const sellerIdx = users.findIndex(u => u.email === me.orders[orderIdx].product.owner);
      if (sellerIdx !== -1) {
        const seller = users[sellerIdx];
        const sellerOrder = (seller.orders || []).find(o => o.id === orderId);
        if (sellerOrder) {
          sellerOrder.notReceived = true;
          sellerOrder.status = "Pending";
        }
        users.splice(sellerIdx, 1, seller);
      }
    }

    users.splice(meIdx, 1, me);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  };

  const submitRating = () => {
    if (!ratingOrderId || ratingValue === 0) return;
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const meIdx = users.findIndex(u => u.email === auth.email);
    if (meIdx === -1) return;

    const me = users[meIdx];
    const orderIdx = me.orders.findIndex(o => o.id === ratingOrderId);
    if (orderIdx === -1) return;

    me.orders[orderIdx].rating = ratingValue;
    me.orders[orderIdx].rated = true;

    users.splice(meIdx, 1, me);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();

    setRatingOrderId(null);
    setRatingValue(0);
  };

  if (!auth) return <div className="card">Please login to view your orders.</div>;
  if (orders.length === 0) return <div className="card">No orders yet.</div>;

  return (
    <div className="container">
      <h2>My Orders</h2>
      {orders.map(order => {
        // Clear "not received" remark if seller updated status away from Pending
        const showNotReceivedRemark = order.notReceived && order.status === "Pending";

        return (
          <div key={order.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div>
              <div><strong>{order.product.title}</strong></div>
              <div>Seller: {order.product.owner}</div>
              <div>Price: ₹ {order.product.price}</div>
              <div>Payment Method: {order.paymentMethod}</div>

              {/* Status */}
              <div style={{ marginTop: 8 }}>
                <strong>Status: </strong>
                <span style={{
                  color: order.status === "Pending" ? "red" : "black",
                  fontWeight: order.status === "Pending" ? "600" : "400"
                }}>
                  {order.status}
                </span>
              </div>

              {/* Not received remark only when still Pending */}
              {showNotReceivedRemark && (
                <div style={{ color: 'red', marginTop: 6 }}>
                  ⚠️ You marked this order as Not Received
                </div>
              )}

              {/* Delivered buttons (only if not rated and not currently marked Not Received) */}
              {order.status === "Delivered" && !order.rated && !showNotReceivedRemark && (
                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "green",
                      color: "white",
                      cursor: "pointer"
                    }}
                    onClick={() => confirmReceived(order.id, true)}
                  >
                    Successful
                  </button>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "red",
                      color: "white",
                      cursor: "pointer"
                    }}
                    onClick={() => confirmReceived(order.id, false)}
                  >
                    Not Received
                  </button>
                </div>
              )}

              {/* Rating popup */}
              {ratingOrderId === order.id && (
                <div style={{
                  position: 'fixed',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#fff',
                  padding: 20,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  zIndex: 1000
                }}>
                  <h4>Rate your order</h4>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          background: ratingValue === v ? 'green' : '#eee',
                          color: ratingValue === v ? 'white' : 'black',
                          cursor: "pointer"
                        }}
                        onClick={() => setRatingValue(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: "blue",
                        color: "white",
                        cursor: "pointer"
                      }}
                      onClick={submitRating}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Already rated */}
              {order.rated && (
                <div style={{ marginTop: 6 }}>
                  ⭐ Your Rating: {order.rating}/5
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
