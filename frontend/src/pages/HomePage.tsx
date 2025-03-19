import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>LIFESTYLE REDEFINED</h1>
          <p>Discover premium authentic caps that make a statement. Crafted for those who demand both style and quality.</p>
          <Link to="/products" className="shop-now-btn">
            Explore Collection
          </Link>
        </div>
      </div>

      <div className="categories-section">
        <h2>Featured Collections</h2>
        <div className="categories">
          <div className="category">
            <div className="category-image"></div>
            <h3>Baseball Caps</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </div>
          <div className="category">
            <div className="category-image"></div>
            <h3>Snapbacks</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </div>
          <div className="category">
            <div className="category-image"></div>
            <h3>Fitted Caps</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 