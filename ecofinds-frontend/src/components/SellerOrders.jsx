import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';
const STATUS_OPTIONS = [
  "Waiting for Production",
  "Paid",
  "Shipping (Estimated Date)",
  "Ready in Remote",
  "Delivered",
  "Pending"
];

export default function SellerOrders({ auth }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!auth) return;
    loadOrders();
    // eslint-disable-next-line
  }, [auth]);

  function loadOrders() {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    let all = [];
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (order.product?.owner === auth.email) {
          all.push({
            ...order,
            buyerEmail: user.email,
            buyerName: user.username || user.email
          });
        }
      });
    });
    setOrders(all);
  }

  function updateStatus(orderId, buyerEmail, newStatus) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const buyerIdx = users.findIndex(u => u.email === buyerEmail);
    if (buyerIdx === -1) return;
    const buyer = users[buyerIdx];
    const orderIdx = buyer.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    buyer.orders[orderIdx].status = newStatus;
    if (newStatus !== "Pending") delete buyer.orders[orderIdx].notReceived;
    if (newStatus !== "Shipping (Estimated Date)") delete buyer.orders[orderIdx].estimatedDate;

    users.splice(buyerIdx, 1, buyer);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  }

  function setEstimatedDate(orderId, buyerEmail, dateStr) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const buyerIdx = users.findIndex(u => u.email === buyerEmail);
    if (buyerIdx === -1) return;
    const buyer = users[buyerIdx];
    const orderIdx = buyer.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    buyer.orders[orderIdx].estimatedDate = dateStr;
    buyer.orders[orderIdx].status = "Shipping (Estimated Date)";
    delete buyer.orders[orderIdx].notReceived;

    users.splice(buyerIdx, 1, buyer);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  }

  if (!auth) return <div className="card" style={{ padding: 20 }}>Please login to view seller orders.</div>;
  if (!orders || orders.length === 0) return <div className="card" style={{ padding: 20 }}>No orders for your products yet.</div>;

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "20px 0" }}>
      <h2 style={{ marginBottom: 20 }}>Orders for Your Products</h2>

      {orders.map(order => (
        <div
          key={order.id}
          className="card"
          style={{
            marginBottom: 16,
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            transition: "transform 0.1s",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{order.product?.title}</div>
            <div>Buyer: {order.buyerName}</div>
            <div>Price: ₹ {order.product?.price}</div>
            <div>Payment Method: {order.paymentMethod}</div>

            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <label>
                <strong>Status: </strong>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, order.buyerEmail, e.target.value)}
                  style={{
                    marginLeft: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    color: order.status === "Pending" ? "red" : "#333",
                    fontWeight: order.status === "Pending" ? 700 : 500,
                    minWidth: 200
                  }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              {order.notReceived && (
                <div style={{ color: "red", fontWeight: 700 }}>
                  ⚠ Buyer marked Not Received (please respond)
                </div>
              )}

              {order.status === "Shipping (Estimated Date)" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <label style={{ fontSize: 14 }}>Estimated delivery date:</label>
                  <input
                    type="date"
                    value={order.estimatedDate || ""}
                    onChange={(e) => setEstimatedDate(order.id, order.buyerEmail, e.target.value)}
                    style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
