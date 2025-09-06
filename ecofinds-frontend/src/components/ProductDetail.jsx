import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LS_PRODUCTS = 'eco_products_v1';
const LS_USERS = 'eco_users_v1';
const LS_AUTH = 'eco_auth_v1';

export default function ProductDetail({ auth }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    const p = all.find(x => x.id === id);
    setProduct(p || null);
  }, [id]);

  function handleAddToCart() {
    if (!auth) {
      nav('/login');
      return;
    }
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const userIdx = users.findIndex(u => u.email === auth.email);
    if (userIdx === -1) return;
    const user = users[userIdx];
    user.cart = user.cart || [];
    if (!user.cart.find(ci => ci.id === product.id)) user.cart.push(product);
    users.splice(userIdx,1,user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    // update storage
    alert('Added to cart');
  }

  if (!product) return <div className="card">Product not found.</div>;

  return (
    <div className="card detail-card">
      <div className="detail-left">
        <div className="img-large">
          {product.image ? <img src={product.image} alt={product.title} /> : <div className="placeholder-text large">Image</div>}
        </div>
      </div>
      <div className="detail-right">
        <h2>{product.title}</h2>
        <div className="price large">₹ {product.price}</div>
        <div className="meta">Category: {product.category}</div>
        <p>{product.description}</p>
        <div className="owner">Seller: {product.owner}</div>
        <div style={{marginTop:12}}>
          <button className="btn" onClick={handleAddToCart}>Add to Cart</button>
          <button className="btn ghost" onClick={()=>nav(-1)} style={{marginLeft:8}}>Back</button>
        </div>
      </div>
    </div>
  );
}
