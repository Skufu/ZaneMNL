import React from 'react';
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
  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please log in to add items to your cart');
      // Redirect to login page
      // window.location.href = '/login';
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
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
          disabled={product.stock <= 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 