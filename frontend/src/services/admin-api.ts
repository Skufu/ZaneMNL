// Admin API service for handling admin-specific API calls
const API_URL = 'http://localhost:8080';

// Create a reusable fetch function with admin authentication
const fetchWithAdminAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Create headers object properly
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  
  try {
    console.log(`Fetching from ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      console.error(`Request failed: ${response.status} ${errorText}`);
      throw new Error(`Request failed: ${response.status} ${errorText}`);
    }
    
    // Try to parse the response as JSON
    try {
      const clone = response.clone();
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        console.log('Empty response received');
        return {};
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Response text:', text);
        
        // Try to get the response as text if JSON parsing fails
        return { text };
      }
    } catch (e) {
      console.error('Error reading response:', e);
      return {};
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Dashboard metrics
export const getDashboardMetrics = () => fetchWithAdminAuth('/admin/dashboard');

// Products
export const getAdminProducts = () => fetchWithAdminAuth('/admin/products');
export const getAdminProduct = (id: number) => fetchWithAdminAuth(`/admin/products/${id}`);
export const createProduct = (productData: any) => 
  fetchWithAdminAuth('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
export const updateProduct = (id: number, productData: any) => 
  fetchWithAdminAuth(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
export const deleteProduct = (id: number) => 
  fetchWithAdminAuth(`/admin/products/${id}`, {
    method: 'DELETE'
  });

// Orders
export const getAdminOrders = () => fetchWithAdminAuth('/admin/orders');
export const getAdminOrder = (id: number) => fetchWithAdminAuth(`/admin/orders/${id}`);
export const updateOrderStatus = (id: number, status: string) => 
  fetchWithAdminAuth(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
export const verifyPayment = (id: number, reference: string) => 
  fetchWithAdminAuth(`/admin/orders/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ reference })
  });

// Users
export const getAdminUsers = () => fetchWithAdminAuth('/admin/users');
export const updateUserRole = (id: number, role: string) => 
  fetchWithAdminAuth(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });

// Reports
export const getSalesReport = (startDate: string, endDate: string) => 
  fetchWithAdminAuth(`/admin/reports/sales?start=${startDate}&end=${endDate}`);
export const getProductPerformance = () => fetchWithAdminAuth('/admin/reports/products');
export const getRevenueAnalysis = () => fetchWithAdminAuth('/admin/reports/revenue');
export const exportReport = (type: string, format: string) => 
  fetchWithAdminAuth(`/admin/reports/export?type=${type}&format=${format}`);

// Admin login
export const adminLogin = (email: string, password: string) => 
  fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Login failed with status ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.user && data.user.role === 'admin' && data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error('Not authorized as admin');
    }
  }); 