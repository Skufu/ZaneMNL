import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to ZaneMNL</h1>
          <p>Your one-stop shop for stylish and authentic caps</p>
          <Link to="/products" className="shop-now-btn">
            Shop Now
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">🧢</div>
          <h3>Premium Quality</h3>
          <p>Authentic caps from top brands</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Quick shipping across the Philippines</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h3>Best Prices</h3>
          <p>Competitive prices on all products</p>
        </div>
      </div>

      <div className="categories-section">
        <h2>Popular Categories</h2>
        <div className="categories">
          <div className="category">
            <div className="category-image"></div>
            <h3>Baseball Caps</h3>
            <Link to="/products" className="category-link">View All</Link>
          </div>
          <div className="category">
            <div className="category-image"></div>
            <h3>Snapbacks</h3>
            <Link to="/products" className="category-link">View All</Link>
          </div>
          <div className="category">
            <div className="category-image"></div>
            <h3>Fitted Caps</h3>
            <Link to="/products" className="category-link">View All</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 