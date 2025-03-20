import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../services/api';
import './CheckoutPage.css';

// API URL for asset serving
const API_URL = 'http://localhost:8080';

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

interface ShippingAddress {
  full_name: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  // Validation state
  const [formErrors, setFormErrors] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      
      // Redirect to cart if empty
      if (!data.items || data.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCart(data);
      setError(null);
    } catch (err) {
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/70';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {
      full_name: '',
      phone_number: '',
      address: '',
      city: '',
      province: '',
      postal_code: ''
    };
    let isValid = true;

    // Validate each field
    if (!shippingAddress.full_name.trim()) {
      errors.full_name = 'Full name is required';
      isValid = false;
    }

    if (!shippingAddress.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
      isValid = false;
    }

    if (!shippingAddress.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!shippingAddress.province.trim()) {
      errors.province = 'Province is required';
      isValid = false;
    }

    if (!shippingAddress.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Set a timeout to prevent the UI from being stuck indefinitely
    const timeoutId = setTimeout(() => {
      if (submitting) {
        console.error('Order submission timed out after 20 seconds');
        setError('Order submission timed out. Please try again or contact support.');
        setSubmitting(false);
      }
    }, 20000); // 20 second timeout
    
    try {
      setSubmitting(true);
      setError(null); // Clear any previous errors
      
      console.log('Submitting order with shipping address:', shippingAddress);
      console.log('Payment method:', paymentMethod);
      
      // Create order with the complete shipping address
      const orderResponse = await createOrder(shippingAddress, paymentMethod);
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!orderResponse || !orderResponse.order_id) {
        console.error('Invalid order response:', orderResponse);
        setError('Received invalid order data from server. Please try again.');
        setSubmitting(false);
        return;
      }
      
      console.log('Order created successfully:', orderResponse);
      
      // Format shipping address for display on confirmation page
      const formattedAddress = `${shippingAddress.full_name}\n${shippingAddress.phone_number}\n${shippingAddress.address}\n${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postal_code}`;
      
      // Redirect to order confirmation
      navigate('/order-confirmation', { 
        state: { 
          order: orderResponse,
          shippingAddress: formattedAddress,
          paymentMethod
        } 
      });
    } catch (err) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);
      
      console.error('Checkout error:', err);
      let errorMessage = 'Failed to complete checkout. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading">Loading checkout information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchCart}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={shippingAddress.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={formErrors.full_name ? 'error' : ''}
              />
              {formErrors.full_name && (
                <div className="error-text">{formErrors.full_name}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={shippingAddress.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={formErrors.phone_number ? 'error' : ''}
              />
              {formErrors.phone_number && (
                <div className="error-text">{formErrors.phone_number}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="Enter your street address"
                rows={2}
                className={formErrors.address ? 'error' : ''}
              />
              {formErrors.address && (
                <div className="error-text">{formErrors.address}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={formErrors.city ? 'error' : ''}
                />
                {formErrors.city && (
                  <div className="error-text">{formErrors.city}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="province">Province</label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={shippingAddress.province}
                  onChange={handleInputChange}
                  placeholder="Province"
                  className={formErrors.province ? 'error' : ''}
                />
                {formErrors.province && (
                  <div className="error-text">{formErrors.province}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="postal_code">Postal Code</label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={shippingAddress.postal_code}
                  onChange={handleInputChange}
                  placeholder="Postal Code"
                  className={formErrors.postal_code ? 'error' : ''}
                />
                {formErrors.postal_code && (
                  <div className="error-text">{formErrors.postal_code}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-options">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="bankTransfer"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <label htmlFor="bankTransfer">Bank Transfer</label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="gcash"
                    name="paymentMethod"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={() => setPaymentMethod('gcash')}
                  />
                  <label htmlFor="gcash">GCash</label>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="place-order-btn"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="order-items">
            {cart?.items.map(item => (
              <div key={item.cart_item_id} className="order-item">
                <div className="item-image">
                  <img 
                    src={getImageUrl(item.image_url)} 
                    alt={item.name} 
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/70';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div className="item-meta">
                    <span>Qty: {item.quantity}</span>
                    <span>₱{item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="item-total">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{cart?.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{cart?.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 