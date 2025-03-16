import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { getDashboardMetrics } from '../../services/admin-api';
import './AdminDashboard.css';

// Dashboard metrics interface
interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: {
    id: number;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }[];
  topProducts: {
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }[];
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const data = await getDashboardMetrics();
      console.log('Dashboard data received:', data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      setMetrics(data as DashboardMetrics);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
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

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Overview Cards */}
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="card-icon orders-icon">📦</div>
              <div className="card-content">
                <h3>Total Orders</h3>
                <p className="card-value">{metrics?.totalOrders}</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon revenue-icon">💰</div>
              <div className="card-content">
                <h3>Total Revenue</h3>
                <p className="card-value">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon products-icon">🧢</div>
              <div className="card-content">
                <h3>Total Products</h3>
                <p className="card-value">{metrics?.totalProducts}</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon users-icon">👥</div>
              <div className="card-content">
                <h3>Total Users</h3>
                <p className="card-value">{metrics?.totalUsers}</p>
              </div>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="dashboard-section">
            <h2>Recent Orders</h2>
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                    metrics.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>{formatCurrency(order.amount)}</td>
                        <td>
                          <span className={`order-status ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-data">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Products */}
          <div className="dashboard-section">
            <h2>Top Selling Products</h2>
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.topProducts && metrics.topProducts.length > 0 ? (
                    metrics.topProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sales} units</td>
                        <td>{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="no-data">No product data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard; 