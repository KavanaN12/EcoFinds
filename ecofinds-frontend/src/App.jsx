import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import ProductFeed from './components/ProductFeed.jsx';
import AddProduct from './components/AddProduct.jsx';
import MyListings from './components/MyListings.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import Cart from './components/Cart.jsx';
import Dashboard from './components/Dashboard.jsx';
import PreviousPurchases from './components/PreviousPurchases.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import MyOrders from './components/MyOrders.jsx';
import SellerOrders from './components/SellerOrders.jsx'; // ✅ Optional seller order management

// Helpers for localStorage keys
const LS = {
  USERS: 'eco_users_v1',
  PRODUCTS: 'eco_products_v1',
  AUTH: 'eco_auth_v1'
};

// Initialize sample data
function initSampleData() {
  const p = JSON.parse(localStorage.getItem(LS.PRODUCTS) || 'null');
  if (!p) {
    const sampleProducts = [
      {
        id: 'p1',
        title: 'Used Laptop - i5',
        description: 'Lightly used laptop, 8GB RAM, 256GB SSD',
        category: 'Electronics',
        price: 15000,
        image: '',
        owner: 'demo@eco.com'
      },
      {
        id: 'p2',
        title: 'Office Chair - Good Condition',
        description: 'Comfortable rotating chair',
        category: 'Furniture',
        price: 2000,
        image: '',
        owner: 'demo@eco.com'
      },
      {
        id: 'p3',
        title: 'Set of Textbooks',
        description: 'College textbooks, various subjects',
        category: 'Books',
        price: 800,
        image: '',
        owner: 'demo@eco.com'
      }
    ];
    localStorage.setItem(LS.PRODUCTS, JSON.stringify(sampleProducts));
  }

  const u = JSON.parse(localStorage.getItem(LS.USERS) || 'null');
  if (!u) {
    const sampleUsers = [
      { 
        email: 'demo@eco.com', 
        username: 'DemoUser', 
        password: 'demo', 
        ecoPoints: 120, 
        badges: ['Eco Warrior 🌍'], 
        transactions: 3, 
        cart: [], 
        purchases: [], 
        orders: [] 
      }
    ];
    localStorage.setItem(LS.USERS, JSON.stringify(sampleUsers));
  }
}

export default function App() {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem(LS.AUTH) || 'null'));
  const navigate = useNavigate();

  useEffect(() => {
    initSampleData();
  }, []);

  function handleLogout() {
    localStorage.removeItem(LS.AUTH);
    setAuth(null);
    navigate('/login');
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">EcoFinds</Link>
        <nav>
          <Link to="/">Browse</Link>
          {auth && <Link to="/add">Add Product</Link>}
          {auth && <Link to="/my-listings">My Listings</Link>}
          {auth && <Link to="/dashboard">Dashboard</Link>}
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/cart">Cart</Link>
          {auth && <Link to="/orders">My Orders</Link>}
          {auth && <Link to="/seller-orders">Manage Orders</Link>} {/* ✅ Seller panel */}
          {auth ? (
            <>
              <span className="nav-user">Hi, {auth.username}</span>
              <button className="btn small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn small">Login</Link>
              <Link to="/signup" className="btn small">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<ProductFeed auth={auth} />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/signup" element={<Signup setAuth={setAuth} />} />
          <Route path="/add" element={<AddProduct auth={auth} />} />
          <Route path="/my-listings" element={<MyListings auth={auth} />} />
          <Route path="/product/:id" element={<ProductDetail auth={auth} />} />
          <Route path="/cart" element={<Cart auth={auth} setAuth={setAuth} />} />
          <Route path="/dashboard" element={<Dashboard auth={auth} setAuth={setAuth} />} />
          <Route path="/previous" element={<PreviousPurchases auth={auth} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/orders" element={<MyOrders auth={auth} />} /> {/* Buyer orders */}
          <Route path="/seller-orders" element={<SellerOrders auth={auth} />} /> {/* Seller orders */}
          <Route path="*" element={<ProductFeed auth={auth} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div>EcoFinds — Sustainable Second-Hand Marketplace</div>
        <div>Made for Odoo x NMIT Hackathon</div>
      </footer>
    </div>
  );
}
