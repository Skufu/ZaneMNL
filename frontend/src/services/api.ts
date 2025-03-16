// Simplify the API service with consistent patterns
const API_URL = 'http://localhost:8080';

// Create a reusable fetch function to reduce duplication
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('token');
  
  // Create headers object properly
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

// Products API
export const getProducts = () => fetchWithAuth('/products');
export const getProduct = (id: number) => fetchWithAuth(`/products/${id}`);

// Auth API
export const login = (email: string, password: string) => 
  fetchWithAuth('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }).then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  });

export const register = (userData: { username: string; email: string; password: string }) => 
  fetchWithAuth('/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

// Cart API
export const getCart = () => fetchWithAuth('/cart');

export const addToCart = async (productId: number, quantity: number): Promise<any> => {
  try {
    return await fetchWithAuth('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = (productId: number, quantity: number) => 
  fetchWithAuth('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({
      product_id: productId,
      quantity: quantity
    })
  });

export const removeFromCart = (productId: number) => 
  fetchWithAuth(`/cart/${productId}`, {
    method: 'DELETE'
  }).catch(() => {
    // Fallback if DELETE endpoint fails
    return updateCartItemQuantity(productId, 0);
  });

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

// Checkout API
export const createOrder = async (shippingAddress: {
  full_name: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}, paymentMethod: string) => {
  try {
    console.log('Creating order with:', { shippingAddress, paymentMethod });
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      }),
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    console.log('Order creation response status:', response.status);
    
    // Log headers in a way that works with older JavaScript targets
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Order creation response headers:', headers);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      console.error('Order creation failed:', errorText);
      throw new Error(`Order creation failed: ${response.status} ${errorText}`);
    }
    
    // Try to parse the response as JSON
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      // If the response is empty, return a default object
      if (!responseText.trim()) {
        console.warn('Empty response received from server');
        return {
          order_id: Date.now(), // Generate a temporary ID
          status: 'pending',
          total_amount: 0,
          items: []
        };
      }
      
      const data = JSON.parse(responseText);
      console.log('Order created successfully:', data);
      return data;
    } catch (jsonError) {
      console.error('Failed to parse order response as JSON:', jsonError);
      console.error('Response text was:', responseText);
      
      // If we can't parse the response, create a default response object
      // This will prevent the UI from getting stuck
      return {
        order_id: Date.now(), // Generate a temporary ID
        status: 'pending',
        total_amount: 0,
        items: []
      };
    }
  } catch (error) {
    console.error('Order creation error:', error);
    
    // If the request was aborted due to timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Order creation timed out. Please try again.');
    }
    
    throw error;
  }
};

// Get user orders
export const getUserOrders = () => fetchWithAuth('/orders'); 