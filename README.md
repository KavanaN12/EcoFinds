# Eco Marketplace 🌱


A **sustainable marketplace** web app where users can buy, sell, and track eco-friendly products, earn EcoPoints, and monitor their environmental impact — all **offline** using `localStorage`.

---

## Table of Contents

- [Demo](#demo)  
- [Features](#features)  
- [Technologies](#technologies)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [License](#license)  

---

## Demo

> Drive link: https://drive.google.com/file/d/1OUmqr8uq2YtlBMi424Unx-twCVNF-eph/view?usp=drivesdk 

---

## Features

### 🌿 User & Seller

- Sign up / log in (stored in `localStorage`)  
- Profile with username, email, and eco-points  

### 🛍️ Product Management

- Add new product with title, category, description, price  
- Upload image from device or provide a URL  
- Contribution description for sustainability  
- Preview product before submission  

### 🛒 Buyer

- Browse products & view details  
- Add to cart and place orders  
- Confirm **Received / Not Received** orders  
- Rate delivered orders (1–5 stars)  
- Track estimated delivery dates  

### 🏪 Seller

- View all orders for your products  
- Update order status:  
  - Waiting for Production  
  - Paid  
  - Shipping (Estimated Date)  
  - Ready in Remote  
  - Delivered  
  - Pending  
- Set estimated delivery dates  
- View Not Received flags from buyers  

### 🌟 EcoPoints & Badges

- Earn EcoPoints for product listing & eco-friendly actions  
- Badges: Newcomer → Eco Beginner → Eco Warrior → EcoSaver  

---

## Technologies

- **React.js** – Frontend library  
- **React Router** – Page routing  
- **localStorage** – Offline persistent storage  
- **JavaScript (ES6+)** – App logic  
- **CSS** – Styling & responsive design  

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sustainable-marketplace

# Install dependencies
npm install

# Run the app
npm start
