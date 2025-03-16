import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import './AdminDashboard.css';

// Temporary mock data for dashboard metrics
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
    // In a real app, this would be an API call to get dashboard metrics
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData: DashboardMetrics = {
          totalOrders: 156,
          totalRevenue: 285750.50,
          totalProducts: 45,
          totalUsers: 120,
          recentOrders: [
            { id: 1001, customer: 'John Doe', date: '2023-06-15', amount: 2499.99, status: 'delivered' },
            { id: 1002, customer: 'Jane Smith', date: '2023-06-14', amount: 1299.99, status: 'processing' },
            { id: 1003, customer: 'Bob Johnson', date: '2023-06-13', amount: 999.99, status: 'pending' },
            { id: 1004, customer: 'Alice Brown', date: '2023-06-12', amount: 3499.99, status: 'delivered' },
            { id: 1005, customer: 'Charlie Wilson', date: '2023-06-11', amount: 1499.99, status: 'shipped' },
          ],
          topProducts: [
            { id: 101, name: 'New Era Yankees Cap', sales: 42, revenue: 62999.58 },
            { id: 102, name: 'LA Dodgers Fitted Cap', sales: 38, revenue: 49399.62 },
            { id: 103, name: 'Chicago Bulls Snapback', sales: 35, revenue: 34999.65 },
            { id: 104, name: 'Brooklyn Nets Cap', sales: 28, revenue: 36399.72 },
            { id: 105, name: 'Miami Heat Snapback', sales: 25, revenue: 24999.75 },
          ]
        };
        
        setMetrics(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <button onClick={() => window.location.reload()}>Retry</button>
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
                  {metrics?.recentOrders.map(order => (
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
                  ))}
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
                  {metrics?.topProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sales} units</td>
                      <td>{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
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