import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LS_PRODUCTS = 'eco_products_v1';
const LS_AUTH = 'eco_auth_v1';

export default function MyListings({ auth }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    if (auth) {
      setProducts(all.filter(p => p.owner === auth.email));
    } else {
      setProducts([]);
    }
  }, [auth]);

  function handleDelete(id) {
    if (!window.confirm('Delete this listing?')) return;
    const all = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    const remaining = all.filter(p => p.id !== id);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(remaining));
    setProducts(remaining.filter(p => p.owner === auth.email));
  }

  return (
    <div className="container">
      <h2>My Listings</h2>
      <div className="grid">
        {products.map(p => (
          <div className="card product-card" key={p.id}>
            <Link to={`/product/${p.id}`}>
              <div className="img-placeholder">
                {p.image ? <img src={p.image} alt={p.title} /> : <div className="placeholder-text">Image</div>}
              </div>
            </Link>
            <div className="product-info">
              <Link to={`/product/${p.id}`} className="title">{p.title}</Link>
              <div className="price">₹ {p.price}</div>
              <div className="meta">{p.category}</div>
              <div className="actions">
                <Link to={`/product/${p.id}`} className="btn small">View/Edit</Link>
                <button className="btn small ghost" onClick={()=>handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="card">No listings yet.</div>}
      </div>
    </div>
  );
}
