import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_PRODUCTS = 'eco_products_v1';
const LS_USERS = 'eco_users_v1';
const LS_AUTH = 'eco_auth_v1';

export default function AddProduct({ auth }) {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [err, setErr] = useState('');

  if (!auth) {
    return <div className="card">Please <a href="/login">login</a> to add product.</div>;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !price) {
      setErr('Title and price required.');
      return;
    }
    const products = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    const newProd = {
      id: 'p' + Date.now(),
      title, description: desc, category, price: Number(price), image, owner: auth.email
    };
    products.unshift(newProd);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
    // award points for listing
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find(u => u.email === auth.email);
    if (user) {
      user.ecoPoints = (user.ecoPoints || 0) + 10;
      users.splice(users.findIndex(u=>u.email===user.email),1,user);
      localStorage.setItem(LS_USERS, JSON.stringify(users));
    }
    nav('/');
  }

  return (
    <div className="card small-card">
      <h3>Add New Product</h3>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSubmit}>
        <label>Product Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required />
        <label>Category</label>
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Books</option>
          <option>Clothing</option>
          <option>Other</option>
        </select>
        <label>Description</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} />
        <label>Price (₹)</label>
        <input value={price} onChange={e=>setPrice(e.target.value)} type="number" required />
        <label>Image URL (optional)</label>
        <input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." />
        <button className="btn" type="submit">Submit Listing</button>
      </form>
    </div>
  );
}
