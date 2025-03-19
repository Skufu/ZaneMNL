import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../services/api';
import './ProductCard.css';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login page
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    
    try {
      setAdding(true);
      await addToCart(product.product_id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div 
      className="product-card" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-badge">
        {product.stock <= 0 && <span className="out-of-stock">Out of Stock</span>}
        {product.stock > 0 && product.stock <= 5 && <span className="low-stock">Low Stock</span>}
      </div>
      <div className="product-image">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Cap+Image'} 
          alt={product.name} 
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱{product.price.toFixed(2)}</p>
        <div className={`product-description ${isHovered ? 'show' : ''}`}>
          {product.description}
        </div>
        <div className="product-actions">
          <button 
            className={`add-to-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
          >
            {adding ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span className="btn-icon">🛒</span>
                <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 