import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { getAdminOrders, updateOrderStatus, verifyPayment } from '../../services/admin-api';
import './AdminOrders.css';

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

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<number | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      
      if (Array.isArray(data)) {
        setOrders(data);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await updateOrderStatus(orderId, newStatus);
      
      // Update order in state
      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      // Show success message
      alert(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleVerifyPayment = async (orderId: number) => {
    if (!paymentReference.trim()) {
      alert('Please enter a payment reference');
      return;
    }
    
    try {
      setVerifyingOrderId(orderId);
      await verifyPayment(orderId, paymentReference);
      
      // Update order in state
      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, payment_verified: true, payment_reference: paymentReference } 
          : order
      ));
      
      // Reset form
      setPaymentReference('');
      
      // Show success message
      alert(`Payment for Order #${orderId} has been verified`);
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setVerifyingOrderId(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
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

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toString().includes(searchTerm) ||
      order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Order Management">
      <div className="admin-orders">
        <div className="orders-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="orders-error">
            <p>{error}</p>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <div className="no-orders">
                <p>No orders found matching your criteria.</p>
              </div>
            ) : (
              filteredOrders.map(order => (
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
                      <div className="order-total">{formatCurrency(order.total_amount)}</div>
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
                    <div className="order-summary-item">
                      <span>Payment Status:</span>
                      <span className={order.payment_verified ? 'verified' : 'not-verified'}>
                        {order.payment_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-actions">
                    <button 
                      className="toggle-details-btn"
                      onClick={() => toggleOrderDetails(order.order_id)}
                    >
                      {expandedOrder === order.order_id ? 'Hide Details' : 'Show Details'}
                    </button>
                    
                    <div className="status-update">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={updatingOrderId === order.order_id}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === order.order_id && (
                        <span className="updating-status">Updating...</span>
                      )}
                    </div>
                  </div>
                  
                  {expandedOrder === order.order_id && (
                    <div className="order-details">
                      <div className="order-items">
                        <h3>Order Items</h3>
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.name}</td>
                                  <td>{item.quantity}</td>
                                  <td>{formatCurrency(item.price_at_purchase)}</td>
                                  <td>{formatCurrency(item.price_at_purchase * item.quantity)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4}>No items in this order</td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3}>Total</td>
                              <td>{formatCurrency(order.total_amount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      <div className="customer-info">
                        <h3>Customer Information</h3>
                        <div className="info-section">
                          <h4>Shipping Address</h4>
                          <p className="address">
                            {order.shipping_address.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i < order.shipping_address.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </p>
                        </div>
                        
                        <div className="info-section">
                          <h4>Payment Information</h4>
                          <p>Method: {formatPaymentMethod(order.payment_method)}</p>
                          <p>Status: {order.payment_verified ? 'Verified' : 'Not Verified'}</p>
                          {order.payment_reference && (
                            <p>Reference: {order.payment_reference}</p>
                          )}
                          
                          {!order.payment_verified && (order.payment_method === 'bank_transfer' || order.payment_method === 'gcash') && (
                            <div className="payment-verification">
                              <h4>Verify Payment</h4>
                              <div className="verification-form">
                                <input
                                  type="text"
                                  placeholder="Enter payment reference"
                                  value={paymentReference}
                                  onChange={(e) => setPaymentReference(e.target.value)}
                                  className="reference-input"
                                />
                                <button
                                  onClick={() => handleVerifyPayment(order.order_id)}
                                  disabled={verifyingOrderId === order.order_id}
                                  className="verify-btn"
                                >
                                  {verifyingOrderId === order.order_id ? 'Verifying...' : 'Verify Payment'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {order.tracking_number && (
                          <div className="info-section">
                            <h4>Tracking Information</h4>
                            <p>Tracking Number: {order.tracking_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders; 