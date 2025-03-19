import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span className="highlight">ZaneMNL</span></h1>
          <p className="hero-tagline">Your one-stop shop for stylish and authentic caps</p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-primary">
              <span>Shop Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
        <div className="hero-pattern"></div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon premium">🥇</div>
            <h3>Premium Quality</h3>
            <p>Authentic caps from top brands, guaranteed genuine products with quality craftsmanship.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon delivery">⚡</div>
            <h3>Fast Delivery</h3>
            <p>Quick shipping across the Philippines, with same-day dispatch for orders before 2PM.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon price">💸</div>
            <h3>Best Prices</h3>
            <p>Competitive prices on all products, with regular promotions and loyalty discounts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon support">🤝</div>
            <h3>Customer Support</h3>
            <p>Dedicated support team ready to assist you with any inquiries or concerns.</p>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          <div className="category-card baseball">
            <div className="category-overlay">
              <h3>Baseball Caps</h3>
              <Link to="/products" className="btn btn-outline">View Collection</Link>
            </div>
          </div>
          <div className="category-card snapback">
            <div className="category-overlay">
              <h3>Snapbacks</h3>
              <Link to="/products" className="btn btn-outline">View Collection</Link>
            </div>
          </div>
          <div className="category-card fitted">
            <div className="category-overlay">
              <h3>Fitted Caps</h3>
              <Link to="/products" className="btn btn-outline">View Collection</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Amazing quality caps and super fast delivery! Definitely my go-to shop for headwear."</p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">JD</div>
              <div className="testimonial-name">Juan Dela Cruz</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The customer service is exceptional and the products are authentic. Worth every peso!"</p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">MR</div>
              <div className="testimonial-name">Maria Reyes</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Finally found an online shop that sells genuine caps at reasonable prices. Highly recommended!"</p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">PG</div>
              <div className="testimonial-name">Paolo Garcia</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to shop?</h2>
          <p>Browse our collection and find your perfect cap today!</p>
          <Link to="/products" className="btn btn-secondary">Shop All Caps</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 