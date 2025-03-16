import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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
  login: (username: string, password: string) => Promise<boolean>;
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

  const login = async (username: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll use a mock login
    // In a real app, this would call an API endpoint
    if (username === 'admin' && password === 'admin123') {
      const mockAdminUser: AdminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@zanemanila.com',
        role: 'Administrator'
      };
      
      // Store admin data in localStorage
      localStorage.setItem('token', 'mock-admin-token-12345');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', JSON.stringify(mockAdminUser));
      
      // Update state
      setAdminUser(mockAdminUser);
      setIsAdmin(true);
      
      return true;
    }
    
    return false;
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