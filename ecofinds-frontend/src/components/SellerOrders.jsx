import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';
const STATUS_OPTIONS = ["Waiting for Production", "Paid", "Shipping (Estimated Date)", "Ready in Remote", "Delivered", "Pending"];

export default function SellerOrders({ auth }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!auth) return;
    loadOrders();
  }, [auth]);

  const loadOrders = () => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    let allOrders = [];
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (order.product.owner === auth.email) {
          allOrders.push({
            ...order,
            buyerEmail: user.email,
            buyerName: user.username || user.email
          });
        }
      });
    });
    setOrders(allOrders);
  };

  const updateStatus = (orderId, buyerEmail, newStatus) => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const buyerIdx = users.findIndex(u => u.email === buyerEmail);
    if (buyerIdx === -1) return;

    const buyer = users[buyerIdx];
    const orderIdx = buyer.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    buyer.orders[orderIdx].status = newStatus;

    users.splice(buyerIdx, 1, buyer);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  };

  if (!auth) return <div className="card">Please login to view seller orders.</div>;
  if (orders.length === 0) return <div className="card">No orders for your products yet.</div>;

  return (
    <div className="container">
      <h2>Orders for Your Products</h2>
      {orders.map(order => (
        <div key={order.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
          <div>
            <div><strong>{order.product.title}</strong></div>
            <div>Buyer: {order.buyerName}</div>
            <div>Price: ₹ {order.product.price}</div>
            <div>Payment Method: {order.paymentMethod}</div>

            <div style={{ marginTop: 8 }}>
              <strong>Status: </strong>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, order.buyerEmail, e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  color: order.status === "Pending" ? "red" : "black",
                  fontWeight: order.status === "Pending" ? "600" : "400"
                }}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
