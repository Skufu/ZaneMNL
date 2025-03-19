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
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image_url || 'https://via.placeholder.com/150'} 
          alt={product.name} 
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