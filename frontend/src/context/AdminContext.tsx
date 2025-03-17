import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';

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
      // Use the real login API
      const response = await apiLogin(email, password);
      
      if (response && response.token) {
        // Check if the user is an admin
        if (response.role === 'admin') {
          const adminUser: AdminUser = {
            id: response.user_id || 1,
            username: response.username || 'admin',
            email: email,
            role: 'Administrator'
          };
          
          // Store admin data in localStorage
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
          
          // Update state
          setAdminUser(adminUser);
          setIsAdmin(true);
          
          return true;
        } else {
          // Not an admin
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const checkAdminStatus = (): boolean => {
    const token = localStorage.getItem('token');
    const adminFlag = localStorage.getItem('isAdmin');
    const adminUserData = localStorage.getItem('adminUser');

    if (!token || adminFlag !== 'true') {
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
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
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