import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/admin-api';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAdminStatus: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use the admin login API
      const response = await adminLogin(email, password);
      
      if (response && response.token) {
        // The adminLogin function already stores the token and user data
        // Just update the state
        const userData = response.user;
        
        const adminUser: AdminUser = {
          id: userData.user_id || userData.UserID || 1,
          username: userData.username || userData.Username || 'admin',
          email: userData.email || userData.Email || email,
          role: userData.role || userData.Role || 'Administrator'
        };
        
        // Update state
        setAdminUser(adminUser);
        setIsAdmin(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const checkAdminStatus = (): boolean => {
    const token = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');

    if (!token || !adminUserData) {
      setIsAdmin(false);
      setAdminUser(null);
      setLoading(false);
      return false;
    }

    try {
      if (adminUserData) {
        const parsedUser = JSON.parse(adminUserData);
        setAdminUser(parsedUser);
        setIsAdmin(true);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Error parsing admin user data:', error);
    }

    setIsAdmin(false);
    setAdminUser(null);
    setLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAdmin(false);
    setAdminUser(null);
    navigate('/admin/login');
  };

  const value = {
    isAdmin,
    adminUser,
    loading,
    login,
    logout,
    checkAdminStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext; 