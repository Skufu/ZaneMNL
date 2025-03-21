import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="home-page">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ 
          backgroundPosition: `center ${scrollY * 0.5}px`
        }}
      >
        <div className="hero-overlay"></div>
        <motion.div 
          className="hero-content"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.h1 variants={fadeIn}>LIFESTYLE REDEFINED</motion.h1>
          <motion.p 
            variants={fadeIn}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            Discover premium authentic caps that make a statement. Crafted for those who demand both style and quality.
          </motion.p>
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <Link to="/products" className="shop-now-btn">
              Explore Collection
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="features-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </div>
          <h3>Premium Quality</h3>
          <p>Handcrafted with the finest materials for unmatched durability and comfort.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <h3>Unique Designs</h3>
          <p>Stand out with exclusive styles you won't find anywhere else.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <h3>100% Authentic</h3>
          <p>Every cap is guaranteed authentic with certification and premium packaging.</p>
        </div>
      </motion.div>

      <motion.div 
        className="categories-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Featured Collections</h2>
        <div className="categories">
          <motion.div 
            className="category"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="category-image"></div>
            <h3>Baseball Caps</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </motion.div>
          <motion.div 
            className="category"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="category-image"></div>
            <h3>Snapbacks</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </motion.div>
          <motion.div 
            className="category"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="category-image"></div>
            <h3>Fitted Caps</h3>
            <Link to="/products" className="category-link">View Collection</Link>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="cta-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="cta-content">
          <h2>Join Our Community</h2>
          <p>Sign up for our newsletter to receive exclusive offers, new arrivals, and styling tips.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage; 