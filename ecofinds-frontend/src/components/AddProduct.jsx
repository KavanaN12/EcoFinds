import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_PRODUCTS = 'eco_products_v1';
const LS_USERS = 'eco_users_v1';

export default function AddProduct({ auth }) {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(''); // can be URL or Base64
  const [contribution, setContribution] = useState('');
  const [err, setErr] = useState('');

  if (!auth) {
    return <div className="card">Please <a href="/login">login</a> to add product.</div>;
  }

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      setImage(ev.target.result); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !price) {
      setErr('Title and price are required.');
      return;
    }

    const products = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    const newProd = {
      id: 'p' + Date.now(),
      title,
      description: desc,
      category,
      price: Number(price),
      image,
      contribution: contribution || "Supports eco-friendly living.",
      owner: auth.email
    };

    products.unshift(newProd);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));

    // Award points for listing
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const userIdx = users.findIndex(u => u.email === auth.email);
    if (userIdx !== -1) {
      users[userIdx].ecoPoints = (users[userIdx].ecoPoints || 0) + 10;
      users.splice(userIdx, 1, users[userIdx]);
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
        <input value={title} onChange={e => setTitle(e.target.value)} required />

        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Books</option>
          <option>Clothing</option>
          <option>Other</option>
        </select>

        <label>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} />

        <label>Contribution towards Sustainability</label>
        <textarea
          value={contribution}
          onChange={e => setContribution(e.target.value)}
          placeholder="Explain how this product contributes to sustainability"
        />

        <label>Price (₹)</label>
        <input value={price} onChange={e => setPrice(e.target.value)} type="number" required />

        <label>Image URL (optional)</label>
        <input
          value={image.startsWith('data:') ? '' : image} // show URL input only if not Base64
          onChange={e => setImage(e.target.value)}
          placeholder="https://..."
        />

        <div style={{ marginTop: 8 }}>
          <label>Or choose image from your device:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {image && (
          <div style={{ marginTop: 8 }}>
            <strong>Preview:</strong>
            <div style={{ width: 100, height: 100, border: '1px solid #ccc', marginTop: 4 }}>
              <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </div>
          </div>
        )}

        <button className="btn" type="submit" style={{ marginTop: 12 }}>Submit Listing</button>
      </form>
    </div>
  );
}
