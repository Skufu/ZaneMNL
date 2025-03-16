const API_URL = 'http://localhost:8080';

// Mock data for testing
const MOCK_ORDERS = [
  {
    order_id: 1001,
    user_id: 101,
    shipping_address: "John Doe\n123 Main Street\nMakati City\nMetro Manila\n1200\nPhilippines\n+63 912 345 6789",
    payment_method: "gcash",
    order_date: "2023-11-15T08:30:00Z",
    total_amount: 2450,
    status: "delivered",
    tracking_number: "PH123456789",
    payment_verified: true,
    payment_reference: "GC123456789",
    items: [
      {
        product_id: 1,
        name: "Classic White Shirt",
        quantity: 2,
        price_at_purchase: 750
      },
      {
        product_id: 3,
        name: "Denim Jeans",
        quantity: 1,
        price_at_purchase: 950
      }
    ]
  },
  {
    order_id: 1002,
    user_id: 102,
    shipping_address: "Maria Santos\n456 Rizal Avenue\nQuezon City\nMetro Manila\n1100\nPhilippines\n+63 917 876 5432",
    payment_method: "cash_on_delivery",
    order_date: "2023-11-18T14:45:00Z",
    total_amount: 1850,
    status: "processing",
    payment_verified: false,
    items: [
      {
        product_id: 2,
        name: "Black Dress",
        quantity: 1,
        price_at_purchase: 1200
      },
      {
        product_id: 5,
        name: "Casual Sneakers",
        quantity: 1,
        price_at_purchase: 650
      }
    ]
  },
  {
    order_id: 1003,
    user_id: 103,
    shipping_address: "Carlos Reyes\n789 Bonifacio Street\nCebu City\nCebu\n6000\nPhilippines\n+63 918 765 4321",
    payment_method: "bank_transfer",
    order_date: "2023-11-20T10:15:00Z",
    total_amount: 3600,
    status: "shipped",
    tracking_number: "PH987654321",
    payment_verified: true,
    payment_reference: "BT987654321",
    items: [
      {
        product_id: 4,
        name: "Leather Jacket",
        quantity: 1,
        price_at_purchase: 2800
      },
      {
        product_id: 6,
        name: "Cotton Socks",
        quantity: 4,
        price_at_purchase: 200
      }
    ]
  },
  {
    order_id: 1004,
    user_id: 104,
    shipping_address: "Elena Gomez\n321 Mabini Street\nDavao City\nDavao del Sur\n8000\nPhilippines\n+63 919 876 5432",
    payment_method: "gcash",
    order_date: "2023-11-22T16:30:00Z",
    total_amount: 1500,
    status: "pending",
    payment_verified: false,
    items: [
      {
        product_id: 7,
        name: "Summer Dress",
        quantity: 1,
        price_at_purchase: 1500
      }
    ]
  },
  {
    order_id: 1005,
    user_id: 105,
    shipping_address: "Roberto Tan\n567 Luna Street\nBaguio City\nBenguet\n2600\nPhilippines\n+63 920 123 4567",
    payment_method: "bank_transfer",
    order_date: "2023-11-25T09:45:00Z",
    total_amount: 4250,
    status: "cancelled",
    payment_verified: false,
    items: [
      {
        product_id: 8,
        name: "Winter Coat",
        quantity: 1,
        price_at_purchase: 3500
      },
      {
        product_id: 9,
        name: "Wool Scarf",
        quantity: 1,
        price_at_purchase: 750
      }
    ]
  }
];

// Create a reusable fetch function with admin authentication
const fetchWithAdminAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated as admin');
  }
  
  // Create headers object properly
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  
  // For testing purposes, return mock data for orders
  if (endpoint === '/admin/orders') {
    return MOCK_ORDERS;
  }
  
  if (endpoint.match(/\/admin\/orders\/\d+$/)) {
    const orderId = parseInt(endpoint.split('/').pop() || '0');
    const order = MOCK_ORDERS.find(o => o.order_id === orderId);
    if (order) {
      return order;
    }
  }
  
  if (endpoint.match(/\/admin\/orders\/\d+\/status$/)) {
    const orderId = parseInt(endpoint.split('/')[3]);
    const requestBody = JSON.parse(options.body as string);
    const orderIndex = MOCK_ORDERS.findIndex(o => o.order_id === orderId);
    
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = requestBody.status;
      return { success: true, order: MOCK_ORDERS[orderIndex] };
    }
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  // Parse JSON response (or return empty object if it fails)
  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    console.error('Failed to parse response as JSON');
  }
  
  // Handle error responses
  if (!response.ok) {
    throw new Error((data as any).error || `Request failed with status ${response.status}`);
  }
  
  return data;
};

// Dashboard API
export const getDashboardMetrics = () => fetchWithAdminAuth('/admin/dashboard');

// Products API
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

// Orders API
export const getAdminOrders = () => fetchWithAdminAuth('/admin/orders');
export const getAdminOrder = (id: number) => fetchWithAdminAuth(`/admin/orders/${id}`);
export const updateOrderStatus = (id: number, status: string) => 
  fetchWithAdminAuth(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
export const verifyPayment = (id: number, reference: string) => 
  fetchWithAdminAuth(`/admin/orders/${id}/verify-payment`, {
    method: 'PUT',
    body: JSON.stringify({ reference })
  });

// Users API
export const getAdminUsers = () => fetchWithAdminAuth('/admin/users');
export const updateUserRole = (id: number, role: string) => 
  fetchWithAdminAuth(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });

// Sales Reports API
export const getSalesReport = (filters: any) => 
  fetchWithAdminAuth('/admin/reports/sales', {
    method: 'POST',
    body: JSON.stringify(filters)
  });
export const getProductPerformance = (filters: any) => 
  fetchWithAdminAuth('/admin/reports/products', {
    method: 'POST',
    body: JSON.stringify(filters)
  });
export const getRevenueAnalysis = (timeframe: string) => 
  fetchWithAdminAuth(`/admin/reports/revenue?timeframe=${timeframe}`);
export const exportReport = (type: string, filters: any) => 
  fetchWithAdminAuth('/admin/reports/export', {
    method: 'POST',
    body: JSON.stringify({ type, ...filters })
  }); 