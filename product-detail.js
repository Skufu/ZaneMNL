document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const cartModal = document.getElementById('cartModal');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Product elements
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const productStyle = document.getElementById('product-style');
    const productBreadcrumbName = document.getElementById('product-breadcrumb-name');
    const decreaseQuantityBtn = document.getElementById('decrease-quantity');
    const increaseQuantityBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('product-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    // API Base URL
    const API_URL = 'http://localhost:8080';
    
    // Current product being viewed
    let currentProduct = null;
    
    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
            // Update UI for logged in user
            loginBtn.style.display = 'none';
            signupBtn.textContent = 'Logout';
            signupBtn.classList.add('logout-btn');
            
            // Add event listener for logout
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = 'index.html';
            });
            
            // Update cart count
            updateCartCount();
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
        }
    }
    
    // Update cart count badge
    function updateCartCount() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get cart');
            }
            return response.json();
        })
        .then(data => {
            let totalItems = 0;
            if (data.items && data.items.length > 0) {
                totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
            }
            
            cartCount.textContent = totalItems;
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Update cart count error:', error);
        });
    }
    
    // Load product details
    function loadProductDetails() {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            showNotification('Product not found', 'error');
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 2000);
            return;
        }
        
        // Fetch product from API
        fetch(`${API_URL}/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Product not found');
            }
            return response.json();
        })
        .then(product => {
            // Set current product
            currentProduct = product;
            
            // Update product details
            productName.textContent = product.name;
            productPrice.textContent = parseFloat(product.price).toFixed(2);
            productDescription.textContent = product.description;
            productStyle.textContent = product.style || 'Baseball Cap';
            productBreadcrumbName.textContent = product.name;
            
            // Update main image
            mainImage.src = product.image_url || 'images/cap1.png';
            mainImage.alt = product.name;
            
            // Load related products
            loadRelatedProducts();
        })
        .catch(error => {
            console.error('Load product error:', error);
            
            // Fallback to static products if API fails
            const product = window.staticProducts.find(p => p.product_id == productId);
            
            if (!product) {
                showNotification('Product not found', 'error');
                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 2000);
                return;
            }
            
            // Set current product
            currentProduct = product;
            
            // Update product details
            productName.textContent = product.name;
            productPrice.textContent = product.price.toFixed(2);
            productDescription.textContent = product.description;
            productStyle.textContent = product.style || 'Baseball Cap';
            productBreadcrumbName.textContent = product.name;
            
            // Update main image
            mainImage.src = product.image_url || 'images/cap1.png';
            mainImage.alt = product.name;
            
            // Load related products
            loadRelatedProducts();
        });
    }
    
    // Load related products
    function loadRelatedProducts() {
        if (!currentProduct) return;
        
        const relatedProductsGrid = document.querySelector('.related-products-grid');
        
        // Fetch all products from API
        fetch(`${API_URL}/products`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            return response.json();
        })
        .then(products => {
            // Get 4 random products excluding current product
            const relatedProducts = products
                .filter(p => p.product_id != currentProduct.product_id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            
            relatedProductsGrid.innerHTML = '';
            
            relatedProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image_url || 'images/cap1.png'}" alt="${product.name}">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>₱${parseFloat(product.price).toFixed(2)}</p>
                        <button class="add-to-cart-btn" data-id="${product.product_id}">Add to Cart</button>
                    </div>
                `;
                
                relatedProductsGrid.appendChild(productCard);
                
                // Add event listener for add to cart button
                productCard.querySelector('.add-to-cart-btn').addEventListener('click', function() {
                    addToCart(this.dataset.id, 1);
                });
                
                // Add event listener for product card click
                productCard.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('add-to-cart-btn')) {
                        window.location.href = `product-detail.html?id=${product.product_id}`;
                    }
                });
            });
        })
        .catch(error => {
            console.error('Load related products error:', error);
            
            // Fallback to static products if API fails
            const relatedProducts = window.staticProducts
                .filter(p => p.product_id != currentProduct.product_id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            
            relatedProductsGrid.innerHTML = '';
            
            relatedProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image_url || 'images/cap1.png'}" alt="${product.name}">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>₱${product.price.toFixed(2)}</p>
                        <button class="add-to-cart-btn" data-id="${product.product_id}">Add to Cart</button>
                    </div>
                `;
                
                relatedProductsGrid.appendChild(productCard);
                
                // Add event listener for add to cart button
                productCard.querySelector('.add-to-cart-btn').addEventListener('click', function() {
                    addToCart(this.dataset.id, 1);
                });
                
                // Add event listener for product card click
                productCard.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('add-to-cart-btn')) {
                        window.location.href = `product-detail.html?id=${product.product_id}`;
                    }
                });
            });
        });
    }
    
    // Add to cart
    function addToCart(productId, quantity) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            showNotification('Please login to add items to cart', 'error');
            loginModal.classList.add('active');
            return;
        }
        
        // Send request to backend API
        fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Item added to cart', 'success');
            updateCartCount();
        })
        .catch(error => {
            console.error('Add to cart error:', error);
            showNotification(error.message, 'error');
        });
    }
    
    // Buy now function - adds to cart and redirects to checkout
    function buyNow(productId, quantity) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            showNotification('Please login to purchase items', 'error');
            loginModal.classList.add('active');
            return;
        }
        
        // Add to cart first
        fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            return response.json();
        })
        .then(data => {
            // Redirect to checkout
            window.location.href = 'checkout.html';
        })
        .catch(error => {
            console.error('Buy now error:', error);
            showNotification(error.message, 'error');
        });
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
    
    // Load cart
    function loadCart() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Get cart from API
        fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load cart');
            }
            return response.json();
        })
        .then(data => {
            console.log('Cart data:', data); // Debug log
            cartItems.innerHTML = '';
            
            if (!data.items || data.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
                cartSubtotal.textContent = '₱0.00';
                checkoutBtn.disabled = true;
                return;
            }
            
            let subtotal = 0;
            
            data.items.forEach(item => {
                const itemTotal = (item.price * item.quantity);
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" onerror="this.src='images/cap1.png'">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>₱${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.product_id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.product_id}">+</button>
                    </div>
                    <div class="cart-item-remove" data-id="${item.product_id}">
                        <i class="fas fa-trash"></i>
                    </div>
                `;
                
                cartItems.appendChild(cartItem);
                
                // Add event listeners for quantity buttons and remove button
                cartItem.querySelector('.decrease').addEventListener('click', function() {
                    updateCartItemQuantity(this.dataset.id, item.quantity - 1);
                });
                
                cartItem.querySelector('.increase').addEventListener('click', function() {
                    updateCartItemQuantity(this.dataset.id, item.quantity + 1);
                });
                
                cartItem.querySelector('.cart-item-remove').addEventListener('click', function() {
                    removeCartItem(this.dataset.id);
                });
            });
            
            cartSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
            checkoutBtn.disabled = false;
        })
        .catch(error => {
            console.error('Load cart error:', error);
            cartItems.innerHTML = '<p class="error-message">Failed to load cart. Please try again.</p>';
        });
    }
    
    // Update cart item quantity
    function updateCartItemQuantity(productId, quantity) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        if (quantity <= 0) {
            removeCartItem(productId);
            return;
        }
        
        console.log(`Updating cart item: product_id=${productId}, quantity=${quantity}`); // Debug log
        
        // Send request to backend API
        fetch(`${API_URL}/cart/update`, {
            method: 'PUT', // Changed from POST to PUT as it's more RESTful for updates
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update cart item');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Cart updated successfully', 'success');
            loadCart();
            updateCartCount();
        })
        .catch(error => {
            console.error('Update cart item error:', error);
            
            // Try alternative endpoint format
            fetch(`${API_URL}/cart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update cart item (alternative)');
                }
                return response.json();
            })
            .then(data => {
                showNotification('Cart updated successfully', 'success');
                loadCart();
                updateCartCount();
            })
            .catch(altError => {
                console.error('Update cart item alternative error:', altError);
                showNotification('Failed to update cart. Please try again.', 'error');
            });
        });
    }
    
    // Remove cart item
    function removeCartItem(productId) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        console.log(`Removing cart item: product_id=${productId}`); // Debug log
        
        // Try multiple endpoint formats to find the one that works
        // First attempt: RESTful DELETE
        fetch(`${API_URL}/cart/items/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('First removal attempt failed');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Item removed from cart', 'success');
            loadCart();
            updateCartCount();
        })
        .catch(error => {
            console.error('First removal attempt error:', error);
            
            // Second attempt: POST to /cart/remove
            fetch(`${API_URL}/cart/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Second removal attempt failed');
                }
                return response.json();
            })
            .then(data => {
                showNotification('Item removed from cart', 'success');
                loadCart();
                updateCartCount();
            })
            .catch(secondError => {
                console.error('Second removal attempt error:', secondError);
                
                // Third attempt: DELETE to /cart with body
                fetch(`${API_URL}/cart`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        product_id: productId
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Third removal attempt failed');
                    }
                    return response.json();
                })
                .then(data => {
                    showNotification('Item removed from cart', 'success');
                    loadCart();
                    updateCartCount();
                })
                .catch(thirdError => {
                    console.error('Third removal attempt error:', thirdError);
                    
                    // Fourth attempt: PUT to /cart with quantity=0
                    fetch(`${API_URL}/cart/update`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            product_id: productId,
                            quantity: 0
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Fourth removal attempt failed');
                        }
                        return response.json();
                    })
                    .then(data => {
                        showNotification('Item removed from cart', 'success');
                        loadCart();
                        updateCartCount();
                    })
                    .catch(fourthError => {
                        console.error('Fourth removal attempt error:', fourthError);
                        showNotification('Could not remove item. Please try again later.', 'error');
                    });
                });
            });
        });
    }
    
    // Event Listeners
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
            cartModal.classList.remove('active');
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
    
    // Thumbnail click
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update main image
            mainImage.src = this.dataset.image;
        });
    });
    
    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab panel
            const tabId = this.dataset.tab;
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tabId}-tab`) {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    // Quantity controls
    decreaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Add to cart button
    addToCartBtn.addEventListener('click', function() {
        if (!currentProduct) return;
        
        const quantity = parseInt(quantityInput.value);
        addToCart(currentProduct.product_id, quantity);
    });
    
    // Buy now button
    buyNowBtn.addEventListener('click', function() {
        if (!currentProduct) return;
        
        const quantity = parseInt(quantityInput.value);
        buyNow(currentProduct.product_id, quantity);
    });
    
    // Cart icon
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to view your cart', 'error');
            loginModal.classList.add('active');
            return;
        }
        
        loadCart();
        cartModal.classList.add('active');
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Send login request to backend API
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }
            return response.json();
        })
        .then(data => {
            // Store token and user ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.user_id);
            
            loginModal.classList.remove('active');
            checkAuthStatus();
            showNotification('Login successful', 'success');
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Login error:', error);
        });
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
        
        // Send registration request to backend API
        fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // After successful registration, log the user in
            return fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login after registration failed');
            }
            return response.json();
        })
        .then(data => {
            // Store token and user ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.user_id);
            
            signupModal.classList.remove('active');
            checkAuthStatus();
            showNotification('Signup successful', 'success');
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Registration error:', error);
        });
    });
    
    // Initialize
    checkAuthStatus();
    loadProductDetails();
}); 