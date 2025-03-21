import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdmin } from '../../../context/AdminContext';
import './Sidebar.css';

// Icons (you can replace these with actual icons from a library like react-icons)
const DashboardIcon = () => <span className="sidebar-icon">📊</span>;
const ProductsIcon = () => <span className="sidebar-icon">📦</span>;
const OrdersIcon = () => <span className="sidebar-icon">🛒</span>;
const ReportsIcon = () => <span className="sidebar-icon">📈</span>;
const LogoutIcon = () => <span className="sidebar-icon">🚪</span>;

const Sidebar: React.FC = () => {
  const { adminUser, logout } = useAdmin();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>ZaneMNL Admin</h2>
        <div className="admin-info">
          <div className="admin-avatar">
            {adminUser?.username.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="admin-details">
            <p className="admin-name">{adminUser?.username || 'Admin'}</p>
            <p className="admin-role">{adminUser?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/admin/dashboard" 
              className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              <DashboardIcon />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/products" 
              className={`sidebar-link ${isActive('/admin/products') ? 'active' : ''}`}
            >
              <ProductsIcon />
              Products
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/orders" 
              className={`sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}
            >
              <OrdersIcon />
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/reports" 
              className={`sidebar-link ${isActive('/admin/reports') ? 'active' : ''}`}
            >
              <ReportsIcon />
              Sales Reports
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 