// API service for making requests to the backend
const API_URL = 'http://localhost:8080';

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
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
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

// Get cart contents
export const getCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add to cart with retry mechanism
export const addToCart = async (productId: number, quantity: number, retries = 2): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    console.log(`Adding to cart - ProductID: ${productId}, Quantity: ${quantity}`);
    
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    // Try to parse the response as JSON
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
    }

    if (!response.ok) {
      throw new Error(errorData.error || `Failed to add item to cart (${response.status})`);
    }

    return errorData;
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    // If we have retries left and it might be a transient error,
    // wait a bit and try again
    if (retries > 0 && error instanceof Error && 
        (error.message.includes('500') || 
         error.message.includes('database') || 
         error.message.includes('try again'))) {
      console.log(`Retrying addToCart (${retries} retries left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return addToCart(productId, quantity, retries - 1);
    }
    
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (productId: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    console.log(`Removing from cart - ProductID: ${productId}`);
    
    // Check if the backend has the DELETE endpoint implemented
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.log('DELETE endpoint not available, falling back to update with quantity 0');
    } catch (e) {
      console.log('Error using DELETE endpoint, falling back to update:', e);
    }
    
    // Fallback: use the update endpoint with quantity 0
    const response = await fetch(`${API_URL}/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove item from cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Update cart item quantity (set to specific value)
export const updateCartItemQuantity = async (productId: number, quantity: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    console.log(`Updating cart - ProductID: ${productId}, New Quantity: ${quantity}`);
    
    // Try the PUT /cart/update endpoint first
    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.log('PUT endpoint not available, falling back to POST /cart/add');
    } catch (e) {
      console.log('Error using PUT endpoint, falling back to POST:', e);
    }
    
    // Fallback: use the POST /cart/add endpoint
    // This is not ideal but might work if the backend treats it as a replacement
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

// Decrease cart item quantity
export const decreaseCartItemQuantity = async (productId: number, decreaseBy: number = 1) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    console.log(`Decreasing cart item - ProductID: ${productId}, DecreaseBy: ${decreaseBy}`);
    
    // Try the POST /cart/decrease endpoint first
    try {
      const response = await fetch(`${API_URL}/cart/decrease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          decrease_by: decreaseBy
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.log('Decrease endpoint not available, falling back to get-then-update');
    } catch (e) {
      console.log('Error using decrease endpoint, falling back:', e);
    }
    
    // Fallback: get current quantity, then update with new quantity
    const cart = await getCart();
    const item = cart.items.find((item: any) => item.product_id === productId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }
    
    const newQuantity = Math.max(1, item.quantity - decreaseBy);
    return updateCartItemQuantity(productId, newQuantity);
  } catch (error) {
    console.error('Error decreasing cart item quantity:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    console.log('Clearing cart');
    
    // Try the DELETE /cart endpoint
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.log('Clear cart endpoint not available, falling back to manual clear');
    } catch (e) {
      console.log('Error using clear cart endpoint, falling back:', e);
    }
    
    // Fallback: get all items and remove them one by one
    const cart = await getCart();
    const promises = cart.items.map((item: any) => 
      removeFromCart(item.product_id)
    );
    
    await Promise.all(promises);
    return { message: "Cart cleared successfully" };
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}; 