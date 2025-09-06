import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LS_PRODUCTS = 'eco_products_v1';

export default function ProductFeed({ auth }) {
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    setProducts(p);
  }, []);

  const categories = ['All', 'Electronics', 'Furniture', 'Books', 'Clothing', 'Other'];

  function filtered() {
    return products.filter(prod => {
      if (cat !== 'All' && prod.category !== cat) return false;
      if (q && !prod.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }

  return (
    <div className="container">
      <div className="searchbar">
        <input placeholder="Search by title..." value={q} onChange={e=>setQ(e.target.value)} />
        <select value={cat} onChange={e=>setCat(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid">
        {filtered().map(p => (
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
              <div className="owner">Seller: {p.owner}</div>
            </div>
          </div>
        ))}
        {filtered().length === 0 && <div className="card">No items found.</div>}
      </div>

      <div style={{marginTop:20}}>
        {!auth ? <Link to="/login" className="btn">Login to add items</Link> : <Link to="/add" className="btn">+ Add New Product</Link>}
      </div>
    </div>
  );
}
