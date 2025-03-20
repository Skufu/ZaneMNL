import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { getSalesReport, getAdminOrders } from '../../services/admin-api';
import './AdminSalesReport.css';

// Sales data interfaces
interface SalesByDate {
  date: string;
  orders: number;
  revenue: number;
}

interface SalesByProduct {
  product_id: number;
  name: string;
  quantity: number;
  revenue: number;
}

interface SalesByPaymentMethod {
  method: string;
  orders: number;
  revenue: number;
}

interface Order {
  order_id: number;
  user_id: number;
  status: string;
  payment_method: string;
  total_amount: number;
  order_date: string;
  payment_verified: boolean;
  items: {
    product_id: number;
    name: string;
    quantity: number;
    price_at_purchase: number;
  }[];
}

const AdminSalesReport: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to 30 days ago
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });
  const [periodLabel, setPeriodLabel] = useState('Last 30 Days');

  // Fetch orders on component mount and when date range changes
  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // For now, since the reports API might not be implemented, we'll use the orders API
      const data = await getAdminOrders();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      // Filter orders by date range
      const filteredOrders = data.filter((order: Order) => {
        const orderDate = new Date(order.order_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        
        return orderDate >= start && orderDate <= end;
      });
      
      setOrders(filteredOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set date range to predefined periods
  const setPeriod = (days: number, label: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setPeriodLabel(label);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate total revenue from filtered orders
  const totalRevenue = orders.reduce((sum, order) => 
    order.payment_verified ? sum + order.total_amount : sum, 0);

  // Calculate sales by date
  const calculateSalesByDate = (): SalesByDate[] => {
    const salesByDate: { [date: string]: SalesByDate } = {};
    
    orders.forEach(order => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date, orders: 0, revenue: 0 };
      }
      
      salesByDate[date].orders += 1;
      if (order.payment_verified) {
        salesByDate[date].revenue += order.total_amount;
      }
    });
    
    return Object.values(salesByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate sales by product
  const calculateSalesByProduct = (): SalesByProduct[] => {
    const salesByProduct: { [id: number]: SalesByProduct } = {};
    
    orders.forEach(order => {
      if (!order.items) return;
      
      order.items.forEach(item => {
        if (!salesByProduct[item.product_id]) {
          salesByProduct[item.product_id] = { 
            product_id: item.product_id, 
            name: item.name, 
            quantity: 0, 
            revenue: 0 
          };
        }
        
        salesByProduct[item.product_id].quantity += item.quantity;
        if (order.payment_verified) {
          salesByProduct[item.product_id].revenue += item.price_at_purchase * item.quantity;
        }
      });
    });
    
    return Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate sales by payment method
  const calculateSalesByPaymentMethod = (): SalesByPaymentMethod[] => {
    const salesByMethod: { [method: string]: SalesByPaymentMethod } = {};
    
    orders.forEach(order => {
      const method = order.payment_method || 'Unknown';
      
      if (!salesByMethod[method]) {
        salesByMethod[method] = { method, orders: 0, revenue: 0 };
      }
      
      salesByMethod[method].orders += 1;
      if (order.payment_verified) {
        salesByMethod[method].revenue += order.total_amount;
      }
    });
    
    return Object.values(salesByMethod).sort((a, b) => b.revenue - a.revenue);
  };

  // Get formatted payment method name
  const formatPaymentMethod = (method: string): string => {
    switch (method.toLowerCase()) {
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

  // Data for rendering
  const salesByDate = calculateSalesByDate();
  const salesByProduct = calculateSalesByProduct();
  const salesByPaymentMethod = calculateSalesByPaymentMethod();

  return (
    <AdminLayout title="Sales Reports">
      {loading ? (
        <div className="report-loading">
          <div className="loading-spinner"></div>
          <p>Loading sales data...</p>
        </div>
      ) : error ? (
        <div className="report-error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Retry</button>
        </div>
      ) : (
        <div className="sales-report-content">
          {/* Filter controls */}
          <div className="report-filters">
            <div className="date-filters">
              <div className="date-range">
                <label>
                  Start Date:
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  End Date:
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="quick-filters">
                <button onClick={() => setPeriod(7, 'Last 7 Days')}>7 Days</button>
                <button onClick={() => setPeriod(30, 'Last 30 Days')}>30 Days</button>
                <button onClick={() => setPeriod(90, 'Last 90 Days')}>90 Days</button>
                <button onClick={() => setPeriod(365, 'Last Year')}>1 Year</button>
              </div>
            </div>
            <div className="report-summary">
              <h3>Summary for {periodLabel}</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Avg. Order Value</span>
                  <span className="stat-value">
                    {orders.length > 0 
                      ? formatCurrency(totalRevenue / orders.length) 
                      : formatCurrency(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Product */}
          <div className="report-section">
            <h2>Top Selling Products</h2>
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByProduct.length > 0 ? (
                    salesByProduct.map(product => (
                      <tr key={product.product_id}>
                        <td>{product.name}</td>
                        <td>{product.quantity} units</td>
                        <td>{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="no-data">No product sales data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales by Date */}
          <div className="report-section">
            <h2>Daily Sales</h2>
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByDate.length > 0 ? (
                    salesByDate.map(day => (
                      <tr key={day.date}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td>{day.orders}</td>
                        <td>{formatCurrency(day.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="no-data">No daily sales data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales by Payment Method */}
          <div className="report-section">
            <h2>Sales by Payment Method</h2>
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByPaymentMethod.length > 0 ? (
                    salesByPaymentMethod.map(method => (
                      <tr key={method.method}>
                        <td>{formatPaymentMethod(method.method)}</td>
                        <td>{method.orders}</td>
                        <td>{formatCurrency(method.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="no-data">No payment method data available</td>
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

export default AdminSalesReport; 