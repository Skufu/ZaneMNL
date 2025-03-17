import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import './OrdersPage.css';

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
  tracking_number?: string;
  payment_verified: boolean;
  payment_reference?: string;
  items: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders();
      console.log('Orders data:', data);
      setOrders(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchOrders}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="shop-now-btn">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <div className="order-number">Order #{order.order_id}</div>
                  <div className="order-date">{formatDate(order.order_date)}</div>
                </div>
                <div className="order-meta">
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                  <div className="order-total">₱{order.total_amount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="order-summary">
                <div className="order-summary-item">
                  <span>Items:</span>
                  <span>{order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</span>
                </div>
                <div className="order-summary-item">
                  <span>Payment:</span>
                  <span>{formatPaymentMethod(order.payment_method)}</span>
                </div>
                {order.tracking_number && (
                  <div className="order-summary-item">
                    <span>Tracking:</span>
                    <span>{order.tracking_number}</span>
                  </div>
                )}
              </div>
              
              <button 
                className="toggle-details-btn"
                onClick={() => toggleOrderDetails(order.order_id)}
              >
                {expandedOrder === order.order_id ? 'Hide Details' : 'Show Details'}
              </button>
              
              {expandedOrder === order.order_id && (
                <div className="order-details">
                  <div className="order-items">
                    <h3>Order Items</h3>
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
                  
                  <div className="shipping-info">
                    <h3>Shipping Information</h3>
                    <p className="address">
                      {order.shipping_address.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < order.shipping_address.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  
                  {order.payment_method === 'bank_transfer' && (
                    <div className="payment-info">
                      <h3>Payment Information</h3>
                      <p>Please transfer the total amount to:</p>
                      <p>Bank: Sample Bank</p>
                      <p>Account Name: Zane MNL</p>
                      <p>Account Number: 1234567890</p>
                      <p>Reference: Order #{order.order_id}</p>
                      <p className="payment-status">
                        Payment Status: {order.payment_verified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  )}
                  
                  {order.payment_method === 'gcash' && (
                    <div className="payment-info">
                      <h3>Payment Information</h3>
                      <p>Please send the total amount to:</p>
                      <p>GCash Number: 09123456789</p>
                      <p>Account Name: Zane MNL</p>
                      <p>Reference: Order #{order.order_id}</p>
                      <p className="payment-status">
                        Payment Status: {order.payment_verified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 