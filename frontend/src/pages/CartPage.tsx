import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from '../services/api';

interface CartItem {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simple increment handler
  const handleIncrement = async (productId: number) => {
    try {
      setUpdating(productId);
      await addToCart(productId, 1);
      await fetchCart();
    } catch (err) {
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Simple decrement handler
  const handleDecrement = async (productId: number, currentQuantity: number) => {
    if (currentQuantity <= 1) return;
    
    try {
      setUpdating(productId);
      await updateCartItemQuantity(productId, currentQuantity - 1);
      await fetchCart();
    } catch (err) {
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Simple remove handler
  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdating(productId);
      await removeFromCart(productId);
      await fetchCart();
    } catch (err) {
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchCart}>
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // For demonstration purposes, let's add a debug section
  const debugInfo = (
    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
      <h3>Debug Information</h3>
      <p>This section is for development only and should be removed in production.</p>
      <p>Cart contains {cart.items.length} items with subtotal: ₱{cart.subtotal.toFixed(2)}</p>
      <button onClick={fetchCart} style={{ marginTop: '0.5rem' }}>Refresh Cart Data</button>
    </div>
  );

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.cart_item_id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/100'} 
                  alt={item.name} 
                />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">₱{item.price.toFixed(2)}</p>
              </div>
              
              <div className="item-quantity">
                <button 
                  onClick={() => handleDecrement(item.product_id, item.quantity)}
                  disabled={item.quantity <= 1 || updating === item.product_id}
                  className="quantity-btn"
                >
                  -
                </button>
                
                <span className="quantity-value">{item.quantity}</span>
                
                <button 
                  onClick={() => handleIncrement(item.product_id)}
                  disabled={updating === item.product_id}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₱{(item.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                className="remove-item-btn"
                onClick={() => handleRemoveItem(item.product_id)}
                disabled={updating === item.product_id}
              >
                {updating === item.product_id ? '...' : '×'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₱{cart.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>₱{cart.subtotal.toFixed(2)}</span>
          </div>
          
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
          
          <Link to="/products" className="continue-shopping-link">
            Continue Shopping
          </Link>
        </div>
      </div>
      
      {/* Include debug info during development */}
      {process.env.NODE_ENV !== 'production' && debugInfo}
    </div>
  );
};

export default CartPage; 