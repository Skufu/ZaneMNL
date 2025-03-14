document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const ordersContainer = document.querySelector('.orders-container');
    
    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (token && user.user_id) {
            // Update UI for logged in user
            loginBtn.style.display = 'none';
            signupBtn.textContent = 'Logout';
            signupBtn.classList.add('logout-btn');
            
            // Add event listener for logout
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
            
            // Update cart count
            updateCartCount();
            
            // Load orders
            loadOrders();
        } else {
            // Update UI for guest
            loginBtn.style.display = 'inline-block';
            signupBtn.textContent = 'Sign up';
            signupBtn.classList.remove('logout-btn');
            
            // Add event listener for login modal
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.classList.add('active');
            });
            
            // Add event listener for signup modal
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                signupModal.classList.add('active');
            });
            
            // Show login prompt
            showEmptyOrders('Please login to view your orders');
        }
    }
    
    // Update cart count badge
    function updateCartCount() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || !user.user_id) return;
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[user.user_id] || { items: [] };
        
        let totalItems = 0;
        if (userCart.items && userCart.items.length > 0) {
            totalItems = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
    
    // Load orders
    function loadOrders() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || !user.user_id) return;
        
        // Get orders from localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '{}');
        const userOrders = orders[user.user_id] || [];
        
        if (userOrders.length === 0) {
            showEmptyOrders('You haven\'t placed any orders yet');
            return;
        }
        
        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear container
        ordersContainer.innerHTML = '';
        
        // Add orders to container
        userOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            // Format date
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Calculate total
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = order.shipping_method === 'express' ? 150 : 100;
            const total = subtotal + shipping;
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">Order #${order.order_id}</div>
                        <div class="order-date">${formattedDate}</div>
                    </div>
                    <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" class="item-image">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">₱${item.price.toFixed(2)}</div>
                                <div class="item-quantity">Quantity: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-summary">
                    <div class="summary-item">
                        <div class="summary-label">Subtotal</div>
                        <div class="summary-value">₱${subtotal.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Shipping</div>
                        <div class="summary-value">₱${shipping.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total</div>
                        <div class="summary-value">₱${total.toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            ordersContainer.appendChild(orderCard);
        });
    }
    
    // Show empty orders message
    function showEmptyOrders(message) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-bag"></i>
                <h2>No Orders Yet</h2>
                <p>${message}</p>
                <a href="shop.html" class="shop-now-btn">Shop Now</a>
            </div>
        `;
    }
    
    // Show notification
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
    
    // Event Listeners
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
        });
    });
    
    // Show signup form
    const showSignupLink = document.getElementById('showSignup');
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    });
    
    // Show login form
    const showLoginLink = document.getElementById('showLogin');
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.remove('active');
        loginModal.classList.add('active');
    });
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== password) {
            showNotification('Invalid email or password', 'error');
            return;
        }
        
        // Create token
        const token = Date.now().toString();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
            user_id: user.user_id,
            username: user.username,
            email: user.email
        }));
        
        loginModal.classList.remove('active');
        checkAuthStatus();
        showNotification('Login successful', 'success');
    });
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showNotification('Email already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            user_id: Date.now(),
            username,
            email,
            password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Create token
        const token = Date.now().toString();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
            user_id: newUser.user_id,
            username: newUser.username,
            email: newUser.email
        }));
        
        signupModal.classList.remove('active');
        checkAuthStatus();
        showNotification('Signup successful', 'success');
    });
    
    // Initialize
    checkAuthStatus();
}); 