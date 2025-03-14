// Define API_URL at the global scope
const API_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadOrders();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const navLinks = document.querySelector('.nav-links');

    if (token && userId) {
        // User is logged in
        loginBtn.textContent = 'Logout';
        signupBtn.style.display = 'none';
        loginBtn.addEventListener('click', handleLogout);
        
        // Add "View Orders" link if it doesn't exist
        if (!document.querySelector('.nav-links li a[href="view-orders.html"]')) {
            const orderLink = document.createElement('li');
            orderLink.innerHTML = '<a href="view-orders.html" class="active">My Orders</a>';
            navLinks.appendChild(orderLink);
        }
    } else {
        // User is not logged in
        loginBtn.textContent = 'Login';
        signupBtn.style.display = 'inline-block';
        loginBtn.addEventListener('click', () => showModal('loginModal'));
        signupBtn.addEventListener('click', () => showModal('signupModal'));
        
        // Remove "View Orders" link if it exists
        const orderLink = document.querySelector('.nav-links li a[href="view-orders.html"]');
        if (orderLink) {
            orderLink.parentElement.remove();
        }
    }
}

async function loadOrders() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const ordersContainer = document.querySelector('.orders-container');

    if (!token || !userId) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-user-lock"></i>
                <p>Please log in to view your orders</p>
                <a href="#" class="shop-now-btn" onclick="showModal('loginModal')">Login</a>
            </div>
        `;
        return;
    }

    try {
        // Show loading state
        ordersContainer.innerHTML = `
            <div class="loading-orders">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your orders...</p>
            </div>
        `;
        
        // Fetch orders from API
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }
        
        const orders = await response.json();
        console.log('Orders received:', orders);

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-shopping-bag"></i>
                    <p>You haven't placed any orders yet</p>
                    <a href="shop.html" class="shop-now-btn">Shop Now</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.order_id}</div>
                        <div class="order-date">${new Date(order.order_date).toLocaleDateString()}</div>
                    </div>
                    <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items && order.items.map ? order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" onerror="this.src='images/cap1.png'">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">₱${parseFloat(item.price_at_purchase || item.price).toFixed(2)}</div>
                                <div class="item-quantity">Quantity: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('') : '<p>No items found</p>'}
                </div>
                <div class="order-summary">
                    <span>Total Amount:</span>
                    <span>₱${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load orders. Please try again later.</p>
                <p class="error-details">${error.message}</p>
                <button class="retry-btn" onclick="loadOrders()">Retry</button>
            </div>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Show success notification
    showNotification('Logged out successfully!', 'success');
    
    window.location.href = 'index.html';
}

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('form-modal')) {
        closeModal(e.target.id);
    }
});

// Close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.form-modal');
        closeModal(modal.id);
    });
});

// Form switching
document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('loginModal');
    showModal('signupModal');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('signupModal');
    showModal('loginModal');
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        
        // Store token and user ID
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.user_id);
        
        closeModal('loginModal');
        loadOrders();
        checkAuthStatus();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Login successful!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        // Register user
        const registerResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            throw new Error(errorData.error || 'Registration failed');
        }
        
        // Login after registration
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login after registration failed');
        }
        
        const loginData = await loginResponse.json();
        
        // Store token and user ID
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userId', loginData.user.user_id);
        
        closeModal('signupModal');
        loadOrders();
        checkAuthStatus();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Account created successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed: ' + error.message);
    }
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.querySelector('i').classList.toggle('fa-eye');
        toggle.querySelector('i').classList.toggle('fa-eye-slash');
    });
});

// Add this function to show notifications
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 