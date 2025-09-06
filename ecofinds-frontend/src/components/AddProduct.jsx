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
  const [image, setImage] = useState('');
  const [contribution, setContribution] = useState('');
  const [err, setErr] = useState('');

  if (!auth) {
    return <div className="card" style={{ padding: 20 }}>Please <a href="/login">login</a> to add product.</div>;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      setImage(ev.target.result);
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

    // Award points
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
    <div className="card" style={{
      maxWidth: 500,
      margin: "20px auto",
      padding: 24,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      backgroundColor: "#fff"
    }}>
      <h3 style={{ marginBottom: 20 }}>Add New Product</h3>
      {err && <p style={{ color: "red", marginBottom: 12 }}>{err}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>Product Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <label>Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Books</option>
          <option>Clothing</option>
          <option>Other</option>
        </select>

        <label>Description</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minHeight: 60 }}
        />

        <label>Contribution towards Sustainability</label>
        <textarea
          value={contribution}
          onChange={e => setContribution(e.target.value)}
          placeholder="Explain how this product contributes to sustainability"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minHeight: 60 }}
        />

        <label>Price (₹)</label>
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          type="number"
          required
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <label>Image URL (optional)</label>
        <input
          value={image.startsWith('data:') ? '' : image}
          onChange={e => setImage(e.target.value)}
          placeholder="https://..."
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <div>
          <label>Or choose image from your device:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: 6 }} />
        </div>

        {image && (
          <div style={{ marginTop: 12 }}>
            <strong>Preview:</strong>
            <div style={{
              width: 120,
              height: 120,
              border: "1px solid #ccc",
              marginTop: 6,
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img src={image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          style={{
            marginTop: 16,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#333",
            color: "white",
            cursor: "pointer"
          }}
        >
          Submit Listing
        </button>
      </form>
    </div>
  );
}
