import React, { useState, useEffect } from 'react';
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

// API URL for asset serving
const API_URL = 'http://localhost:8080';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Set up the image source when the component mounts or when product changes
  useEffect(() => {
    // For development debugging
    console.log("Product image URL:", product.image_url);
    
    if (!product.image_url) {
      setImageSrc('https://via.placeholder.com/250');
      return;
    }
    
    // If it's already a full URL, use it directly
    if (product.image_url.startsWith('http')) {
      setImageSrc(product.image_url);
    } else {
      // Otherwise prepend the API URL
      setImageSrc(`${API_URL}${product.image_url}`);
      console.log("Full image URL:", `${API_URL}${product.image_url}`);
    }
  }, [product]);

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

  const handleImageError = () => {
    console.log("Image failed to load:", imageSrc);
    setImageError(true);
    setImageSrc('https://via.placeholder.com/250');
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={imageError ? 'https://via.placeholder.com/250' : imageSrc} 
          alt={product.name}
          onError={handleImageError}
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱{product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-stock">
          {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
        </p>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || adding}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 