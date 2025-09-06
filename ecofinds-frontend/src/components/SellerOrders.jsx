import React, { useEffect, useState } from 'react';

const LS_USERS = 'eco_users_v1';
const STATUS_OPTIONS = ["Waiting for Production", "Paid", "Shipping (Estimated Date)", "Ready in Remote", "Delivered", "Pending"];

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

  // update seller chooses newStatus; propagate to buyer and clear notReceived if applicable
  function updateStatus(orderId, buyerEmail, newStatus) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const buyerIdx = users.findIndex(u => u.email === buyerEmail);
    if (buyerIdx === -1) return;
    const buyer = users[buyerIdx];
    const orderIdx = buyer.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    // set status on buyer order
    buyer.orders[orderIdx].status = newStatus;

    // If seller changes status away from Pending, remove buyer's notReceived flag
    if (newStatus !== "Pending") {
      delete buyer.orders[orderIdx].notReceived;
    }

    // if seller changed away from "Shipping (Estimated Date)", we may clear estimatedDate unless they set it separately
    if (newStatus !== "Shipping (Estimated Date)") {
      delete buyer.orders[orderIdx].estimatedDate;
    }

    // persist buyer changes
    users.splice(buyerIdx, 1, buyer);
    localStorage.setItem(LS_USERS, JSON.stringify(users));

    // reload seller view to reflect changes
    loadOrders();
  }

  // set estimated date (seller action) — stored on buyer's order
  function setEstimatedDate(orderId, buyerEmail, dateStr) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const buyerIdx = users.findIndex(u => u.email === buyerEmail);
    if (buyerIdx === -1) return;
    const buyer = users[buyerIdx];
    const orderIdx = buyer.orders.findIndex(o => o.id === orderId);
    if (orderIdx === -1) return;

    buyer.orders[orderIdx].estimatedDate = dateStr;
    // ensure status indicates shipping if not already
    buyer.orders[orderIdx].status = "Shipping (Estimated Date)";

    // if buyer previously marked notReceived, clear it now (seller is acting)
    delete buyer.orders[orderIdx].notReceived;

    users.splice(buyerIdx, 1, buyer);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    loadOrders();
  }

  if (!auth) return <div className="card">Please login to view seller orders.</div>;
  if (!orders || orders.length === 0) return <div className="card">No orders for your products yet.</div>;

  return (
    <div className="container">
      <h2>Orders for Your Products</h2>

      {orders.map(order => (
        <div key={order.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{order.product?.title}</div>
              <div>Buyer: {order.buyerName}</div>
              <div>Price: ₹ {order.product?.price}</div>
              <div>Payment Method: {order.paymentMethod}</div>

              <div style={{ marginTop: 8 }}>
                <strong>Status: </strong>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, order.buyerEmail, e.target.value)}
                  style={{
                    marginLeft: 8,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    color: order.status === "Pending" ? "red" : "black",
                    fontWeight: order.status === "Pending" ? 700 : 500
                  }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Show small red Not Received note if buyer flagged it */}
                {order.notReceived && (
                  <div style={{ color: "red", marginTop: 8, fontWeight: 700 }}>
                    ⚠ Buyer marked Not Received (please respond)
                  </div>
                )}
              </div>

              {/* If status is Shipping (Estimated Date), allow seller to set date */}
              {order.status === "Shipping (Estimated Date)" && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 14 }}>Estimated delivery date: </label>
                  <input
                    type="date"
                    value={order.estimatedDate || ""}
                    onChange={(e) => setEstimatedDate(order.id, order.buyerEmail, e.target.value)}
                    style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc" }}
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
