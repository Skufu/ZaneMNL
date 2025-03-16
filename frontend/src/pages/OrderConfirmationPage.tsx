import React, { useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import './OrderConfirmationPage.css';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  order_id: number;
  user_id: number;
  shipping_address: string;
  payment_method: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
}

interface LocationState {
  order: Order;
  shippingAddress: string;
  paymentMethod: string;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  useEffect(() => {
    // Log the received state for debugging
    console.log('OrderConfirmationPage received state:', state);
  }, [state]);
  
  // If no order data, redirect to home
  if (!state || !state.order) {
    console.error('No order data found in location state');
    return <Navigate to="/" />;
  }
  
  const { order, shippingAddress, paymentMethod } = state;
  
  // Validate order data
  if (!order.order_id || !order.total_amount) {
    console.error('Invalid order data:', order);
    return (
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          <div className="confirmation-header">
            <h1>Order Error</h1>
            <p>There was a problem processing your order. Please contact customer support.</p>
          </div>
          <div className="confirmation-actions">
            <Link to="/cart" className="view-orders-btn">
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'gcash':
        return 'GCash';
      default:
        return method;
    }
  };

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <h1>Order Confirmed!</h1>
          <div className="order-number">Order #{order.order_id}</div>
          <p>Thank you for your purchase. We've received your order and will process it shortly.</p>
        </div>
        
        <div className="order-details">
          <div className="detail-section">
            <h3>Order Summary</h3>
            <div className="order-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-name">
                      {item.name} <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <div className="item-price">
                      ₱{(item.price_at_purchase * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in this order</p>
              )}
            </div>
            
            <div className="order-total">
              <span>Total</span>
              <span>₱{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Shipping Information</h3>
            <p>{shippingAddress}</p>
          </div>
          
          <div className="detail-section">
            <h3>Payment Method</h3>
            <p>{formatPaymentMethod(paymentMethod)}</p>
            
            {paymentMethod === 'bank_transfer' && (
              <div className="payment-instructions">
                <h4>Bank Transfer Instructions</h4>
                <p>Please transfer the total amount to:</p>
                <p>Bank: Sample Bank</p>
                <p>Account Name: Zane MNL</p>
                <p>Account Number: 1234567890</p>
                <p>Reference: Order #{order.order_id}</p>
              </div>
            )}
            
            {paymentMethod === 'gcash' && (
              <div className="payment-instructions">
                <h4>GCash Instructions</h4>
                <p>Please send the total amount to:</p>
                <p>GCash Number: 09123456789</p>
                <p>Account Name: Zane MNL</p>
                <p>Reference: Order #{order.order_id}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="confirmation-actions">
          <Link to="/orders" className="view-orders-btn">
            View My Orders
          </Link>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 