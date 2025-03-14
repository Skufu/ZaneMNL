document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const filterLinks = document.querySelectorAll('.filter-group ul li a');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const sortOptions = document.getElementById('sortOptions');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const cartCount = document.querySelector('.cart-count');
    
    // API Base URL
    const API_URL = 'http://localhost:8080';
    
    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const navLinks = document.querySelector('.nav-links');
        
        if (token && userId) {
            // User is logged in
            loginBtn.textContent = 'Logout';
            signupBtn.style.display = 'none';
            
            // Add event listener for logout
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.reload();
            });
            
            // Add "View Orders" link if it doesn't exist
            if (!document.querySelector('.nav-links li a[href="view-orders.html"]')) {
                const orderLink = document.createElement('li');
                orderLink.innerHTML = '<a href="view-orders.html">My Orders</a>';
                navLinks.appendChild(orderLink);
            }

            // Update cart count
            updateCartCount();
        } else {
            // User is not logged in
            loginBtn.textContent = 'Login';
            signupBtn.style.display = 'inline-block';
            
            // Add event listeners for login/signup
            loginBtn.addEventListener('click', function() {
                document.getElementById('loginModal').style.display = 'flex';
            });
            
            signupBtn.addEventListener('click', function() {
                document.getElementById('signupModal').style.display = 'flex';
            });
            
            // Remove "View Orders" link if it exists
            const orderLink = document.querySelector('.nav-links li a[href="view-orders.html"]');
            if (orderLink) {
                orderLink.parentElement.remove();
            }
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
    
    // State
    let currentFilter = 'all';
    let currentMaxPrice = 2000;
    let currentSort = 'default';
    let currentPage = 1;
    const productsPerPage = 6;
    
    // Products data (using the global staticProducts variable)
    const products = window.staticProducts || [
        {
            product_id: 1,
            name: "NY Yankees",
            description: "Official New York Yankees baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap1.png",
            stock: 50,
            category: "baseball"
        },
        {
            product_id: 2,
            name: "LA Dodgers",
            description: "Official Los Angeles Dodgers baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap2.png",
            stock: 45,
            category: "baseball"
        },
        {
            product_id: 3,
            name: "White Sox",
            description: "Official Chicago White Sox baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap3.png",
            stock: 30,
            category: "fitted"
        },
        {
            product_id: 4,
            name: "Atlanta Braves",
            description: "Official Atlanta Braves baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap4.png",
            stock: 25,
            category: "snapback"
        },
        {
            product_id: 5,
            name: "Oakland A's",
            description: "Official Oakland Athletics baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap5.png",
            stock: 35,
            category: "fitted"
        },
        {
            product_id: 6,
            name: "Boston Red Sox",
            description: "Official Boston Red Sox baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap6.png",
            stock: 40,
            category: "snapback"
        },
        {
            product_id: 7,
            name: "Chicago Cubs",
            description: "Official Chicago Cubs baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap7.png",
            stock: 38,
            category: "trucker"
        },
        {
            product_id: 8,
            name: "Detroit Tigers",
            description: "Official Detroit Tigers baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap8.png",
            stock: 42,
            category: "trucker"
        },
        // Add more products with different prices for better filtering demo
        {
            product_id: 9,
            name: "Premium NY Yankees",
            description: "Limited edition New York Yankees cap with premium materials.",
            price: 1800,
            image_url: "images/cap1.png",
            stock: 15,
            category: "baseball"
        },
        {
            product_id: 10,
            name: "Premium LA Dodgers",
            description: "Limited edition Los Angeles Dodgers cap with premium materials.",
            price: 1800,
            image_url: "images/cap2.png",
            stock: 12,
            category: "baseball"
        },
        {
            product_id: 11,
            name: "Budget White Sox",
            description: "Affordable Chicago White Sox cap for everyday wear.",
            price: 800,
            image_url: "images/cap3.png",
            stock: 60,
            category: "fitted"
        },
        {
            product_id: 12,
            name: "Budget Braves",
            description: "Affordable Atlanta Braves cap for everyday wear.",
            price: 800,
            image_url: "images/cap4.png",
            stock: 55,
            category: "snapback"
        }
    ];
    
    // Filter products based on current filters
    function filterProducts() {
        return products.filter(product => {
            // Filter by category
            const categoryMatch = currentFilter === 'all' || product.category === currentFilter;
            
            // Filter by price
            const priceMatch = product.price <= currentMaxPrice;
            
            return categoryMatch && priceMatch;
        });
    }
    
    // Sort products based on current sort option
    function sortProducts(filteredProducts) {
        const sortedProducts = [...filteredProducts];
        
        switch(currentSort) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Default sorting (by product_id)
                sortedProducts.sort((a, b) => a.product_id - b.product_id);
        }
        
        return sortedProducts;
    }
    
    // Get paginated products
    function getPaginatedProducts(sortedProducts) {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        
        return sortedProducts.slice(startIndex, endIndex);
    }
    
    // Render products to the grid
    function renderProducts() {
        // Apply filters and sorting
        const filteredProducts = filterProducts();
        const sortedProducts = sortProducts(filteredProducts);
        const paginatedProducts = getPaginatedProducts(sortedProducts);
        
        // Clear the grid
        productsGrid.innerHTML = '';
        
        // Add products to the grid
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">No products match your filters</div>';
            return;
        }
        
        paginatedProducts.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.dataset.id = product.product_id;
            productItem.dataset.name = product.name;
            productItem.dataset.description = product.description;
            productItem.dataset.price = product.price;
            productItem.dataset.image = product.image_url;
            productItem.dataset.stock = product.stock;
            
            productItem.innerHTML = `
                <div class="product-item-image">
                    <img src="${product.image_url || 'images/cap1.png'}" alt="${product.name}">
                </div>
                <div class="product-item-info">
                    <h3>${product.name}</h3>
                    <p>₱${product.price.toFixed(2)}</p>
                </div>
                <div class="product-item-actions">
                    <button class="quick-add-btn" data-id="${product.product_id}">Add to Cart</button>
                </div>
            `;
            
            // Add click event to show product details
            productItem.querySelector('.product-item-image').addEventListener('click', function() {
                showProductDetails(product);
            });
            
            productItem.querySelector('.product-item-info').addEventListener('click', function() {
                showProductDetails(product);
            });
            
            // Add quick add to cart functionality
            productItem.querySelector('.quick-add-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                addToCart(product.product_id, 1);
            });
            
            productsGrid.appendChild(productItem);
        });
        
        // Update pagination
        updatePagination(sortedProducts.length);
    }
    
    // Update pagination controls
    function updatePagination(totalProducts) {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        
        currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Update button states
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Show product details (reusing the function from main.js)
    function showProductDetails(product) {
        // Get the product modal elements
        const productModal = document.getElementById('productModal');
        const productName = document.getElementById('productName');
        const productDescription = document.getElementById('productDescription');
        const productPrice = document.getElementById('productPrice');
        const productImage = document.getElementById('productImage');
        const quantityInput = document.getElementById('quantity');
        const addToCartBtn = document.getElementById('addToCartBtn');
        
        // Update modal with product details
        productName.textContent = product.name;
        productDescription.textContent = product.description;
        productPrice.textContent = product.price;
        productImage.src = product.image || product.image_url || 'images/cap1.png';
        
        // Reset quantity
        quantityInput.value = 1;
        
        // Store current product for add to cart functionality
        window.currentProduct = product;
        
        // Add to cart button click handler
        addToCartBtn.onclick = function() {
            const productId = product.id || product.product_id || product.dataset?.id;
            addToCart(productId, parseInt(quantityInput.value));
        };
        
        // Show modal
        productModal.classList.add('active');
    }
    
    // Add to cart function
    function addToCart(productId, quantity) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            showNotification('Please login to add items to your cart', 'error');
            productModal.classList.remove('active');
            document.getElementById('loginModal').classList.add('active');
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
            showNotification('Item added to cart successfully', 'success');
            productModal.classList.remove('active');
            updateCartCount();
        })
        .catch(error => {
            console.error('Add to cart error:', error);
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
    
    // Setup cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            showNotification('Please login to view your cart', 'error');
            document.getElementById('loginModal').classList.add('active');
            return;
        }
        
        // Load cart
        loadCart();
        document.getElementById('cartModal').classList.add('active');
    });
    
    // Load cart
    function loadCart() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        const cartItems = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        cartItems.innerHTML = '<p class="loading">Loading cart...</p>';
        
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
                    <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₱${(item.price).toFixed(2)} x ${item.quantity}</div>
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
        
        // Send request to backend API
        fetch(`${API_URL}/cart/update`, {
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
            showNotification(error.message, 'error');
        });
    }
    
    // Remove cart item
    function removeCartItem(productId) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Send request to backend API
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
                throw new Error('Failed to remove cart item');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Item removed from cart', 'success');
            loadCart();
            updateCartCount();
        })
        .catch(error => {
            console.error('Remove cart item error:', error);
            showNotification(error.message, 'error');
        });
    }
    
    // Setup checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.addEventListener('click', function() {
        checkout();
    });
    
    // Checkout function
    function checkout() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
        if (!userCart.items || userCart.items.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
    
    // Setup modal close buttons
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('signupModal').classList.remove('active');
            document.getElementById('cartModal').classList.remove('active');
            document.getElementById('productModal').classList.remove('active');
        });
    });
    
    // Setup login/signup form switching
    document.getElementById('showSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('signupModal').classList.add('active');
    });
    
    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signupModal').classList.remove('active');
        document.getElementById('loginModal').classList.add('active');
    });
    
    // Setup login form
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
                throw new Error('Invalid credentials');
            }
            return response.json();
        })
        .then(data => {
            // Store user data and token in localStorage
            localStorage.setItem('userId', data.user.user_id);
            localStorage.setItem('token', data.token);
            
            document.getElementById('loginModal').classList.remove('active');
            showNotification('Login successful', 'success');
            
            // Update UI
            checkAuthStatus();
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Login error:', error);
        });
    });
    
    // Setup signup form
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
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
            // Store user data and token in localStorage
            localStorage.setItem('userId', data.user.user_id);
            localStorage.setItem('token', data.token);
            
            document.getElementById('signupModal').classList.remove('active');
            showNotification('Account created successfully', 'success');
            
            // Update UI
            checkAuthStatus();
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Registration error:', error);
        });
    });
    
    // Setup password toggle
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
    
    // Setup login button
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').classList.add('active');
    });
    
    // Setup quantity controls for product modal
    const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
    const increaseQuantityBtn = document.getElementById('increaseQuantity');
    const quantityInput = document.getElementById('quantity');
    
    decreaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        const maxValue = parseInt(quantityInput.getAttribute('max') || '99');
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('loginModal')) {
            document.getElementById('loginModal').classList.remove('active');
        }
        if (e.target === document.getElementById('signupModal')) {
            document.getElementById('signupModal').classList.remove('active');
        }
        if (e.target === document.getElementById('cartModal')) {
            document.getElementById('cartModal').classList.remove('active');
        }
        if (e.target === document.getElementById('productModal')) {
            document.getElementById('productModal').classList.remove('active');
        }
    });
    
    // Event Listeners
    
    // Category filter links
    filterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            filterLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Update filter
            currentFilter = this.dataset.filter;
            
            // Reset to first page
            currentPage = 1;
            
            // Render products with new filter
            renderProducts();
        });
    });
    
    // Price range slider
    priceRange.addEventListener('input', function() {
        currentMaxPrice = parseInt(this.value);
        priceValue.textContent = `₱${currentMaxPrice}`;
        
        // Reset to first page
        currentPage = 1;
        
        // Render products with new price filter
        renderProducts();
    });
    
    // Sort options
    sortOptions.addEventListener('change', function() {
        currentSort = this.value;
        
        // Reset to first page
        currentPage = 1;
        
        // Render products with new sort
        renderProducts();
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const filteredProducts = filterProducts();
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });
    
    // Initialize the shop page
    checkAuthStatus();
    renderProducts();
}); 