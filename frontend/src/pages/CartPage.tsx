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
      console.log('Cart data from server:', data);
      setCart(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update the error handling in your API functions
  const handleApiError = async (err: any) => {
    console.error('API error:', err);
    
    // Check if it's a database lock error
    if (err instanceof Error && 
        (err.message.includes('database is locked') || 
         err.message.includes('Database is locked'))) {
      
      // Wait a moment and try to refresh the cart
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchCart();
      return 'Database was temporarily busy. Please try again.';
    }
    
    return err instanceof Error ? err.message : 'An error occurred. Please try again.';
  };

  // This function handles incrementing the quantity by 1
  const handleIncrement = async (productId: number) => {
    try {
      setUpdating(productId);
      await addToCart(productId, 1);
      await fetchCart();
    } catch (err) {
      console.error('Error incrementing quantity:', err);
      alert(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  // This function handles decrementing the quantity by 1
  const handleDecrement = async (productId: number, currentQuantity: number) => {
    if (currentQuantity <= 1) return;
    
    try {
      setUpdating(productId);
      await updateCartItemQuantity(productId, currentQuantity - 1);
      await fetchCart();
    } catch (err) {
      console.error('Error decrementing quantity:', err);
      alert(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  // This function handles removing an item from the cart
  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdating(productId);
      await removeFromCart(productId);
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove item');
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