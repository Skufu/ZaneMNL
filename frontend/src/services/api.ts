// API service for making requests to the backend
const API_URL = 'http://localhost:8080';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Products API
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Auth API
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    // Store token in localStorage for subsequent requests
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    console.log('Attempting to register with:', userData);
    
    // Try with fetch API first
    try {
      const response = await fetch(`${CORS_PROXY}${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
        mode: 'cors', // Explicitly set CORS mode
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      return data;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      // If fetch fails, try XMLHttpRequest as a fallback
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/register`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Registration failed with status: ' + xhr.status));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR error:', xhr.statusText);
          reject(new Error('Network error occurred'));
        };
        
        xhr.send(JSON.stringify(userData));
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 