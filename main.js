document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const cartModal = document.getElementById('cartModal');
    const productModal = document.getElementById('productModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const carouselPrevBtn = document.querySelector('.prev-btn');
    const carouselNextBtn = document.querySelector('.next-btn');
    const productCarousel = document.querySelector('.product-carousel');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const shopLink = document.getElementById('shop-link');
    const shopCta = document.getElementById('shop-cta');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
    const increaseQuantityBtn = document.getElementById('increaseQuantity');
    const quantityInput = document.getElementById('quantity');

    // Current product being viewed
    let currentProduct = null;

    // API Base URL
    const API_URL = 'http://localhost:8080';
    
    // Static products data
    const staticProducts = [
        {
            product_id: 1,
            name: "NY Yankees",
            description: "Official New York Yankees baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap1.png",
            stock: 50
        },
        {
            product_id: 2,
            name: "LA Dodgers",
            description: "Official Los Angeles Dodgers baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap2.png",
            stock: 45
        },
        {
            product_id: 3,
            name: "White Sox",
            description: "Official Chicago White Sox baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap3.png",
            stock: 30
        },
        {
            product_id: 4,
            name: "Atlanta Braves",
            description: "Official Atlanta Braves baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap4.png",
            stock: 25
        },
        {
            product_id: 5,
            name: "Oakland A's",
            description: "Official Oakland Athletics baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap5.png",
            stock: 35
        },
        {
            product_id: 6,
            name: "Boston Red Sox",
            description: "Official Boston Red Sox baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap6.png",
            stock: 40
        },
        {
            product_id: 7,
            name: "Chicago Cubs",
            description: "Official Chicago Cubs baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap7.png",
            stock: 38
        },
        {
            product_id: 8,
            name: "Detroit Tigers",
            description: "Official Detroit Tigers baseball cap with embroidered logo.",
            price: 1200,
            image_url: "images/cap8.png",
            stock: 42
        }
    ];
    
    // Make staticProducts globally accessible
    window.staticProducts = staticProducts;

    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const navLinks = document.querySelector('.nav-links');
        
        if (token && userId) {
            // User is logged in
            loginBtn.textContent = 'Logout';
            signupBtn.style.display = 'none';
            loginBtn.removeEventListener('click', showLoginModal);
            loginBtn.addEventListener('click', handleLogout);
            
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
            loginBtn.removeEventListener('click', handleLogout);
            loginBtn.addEventListener('click', showLoginModal);
            
            // Remove "View Orders" link if it exists
            const orderLink = document.querySelector('.nav-links li a[href="view-orders.html"]');
            if (orderLink) {
                orderLink.parentElement.remove();
            }
            
            // Hide cart count
            cartCount.style.display = 'none';
        }
    }

    // Update cart count badge
    function updateCartCount() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;

        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
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

    // Initialize products
    function loadProducts() {
        // Clear existing products except the carousel controls
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => card.remove());
        
        // Add products to carousel
        staticProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.product_id;
            productCard.dataset.name = product.name;
            productCard.dataset.description = product.description;
            productCard.dataset.price = product.price;
            productCard.dataset.image = product.image_url;
            productCard.dataset.stock = product.stock;

            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Price<br>₱${(product.price).toFixed(2)}</p>
                </div>
            `;

            // Insert before the carousel controls
            productCarousel.insertBefore(productCard, document.querySelector('.carousel-controls'));

            // Add click event to show product details
            productCard.addEventListener('click', function() {
                showProductDetails(this.dataset);
            });
        });
        
        // Initialize carousel after adding products
        initCarousel();
    }

    // Initialize carousel
    function initCarousel() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        let scrollPosition = 0;
        const cardWidth = 330; // card width + margin
        const maxScroll = -(productCarousel.scrollWidth - productCarousel.clientWidth);
        
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            scrollPosition = Math.max(maxScroll, scrollPosition - cardWidth);
            productCarousel.style.transform = `translateX(${scrollPosition}px)`;
            updateCarouselButtons();
        });
        
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            scrollPosition = Math.min(0, scrollPosition + cardWidth);
            productCarousel.style.transform = `translateX(${scrollPosition}px)`;
            updateCarouselButtons();
        });
        
        function updateCarouselButtons() {
            prevBtn.style.opacity = scrollPosition === 0 ? '0.3' : '1';
            nextBtn.style.opacity = scrollPosition <= maxScroll ? '0.3' : '1';
        }
        
        // Initial button state
        updateCarouselButtons();
    }

    // Show product details
    function showProductDetails(product) {
        currentProduct = product;
        
        // Update modal with product details
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productPrice').textContent = product.price.toFixed(2);
        document.getElementById('productImage').src = product.image_url || 'images/cap1.png';
        
        // Reset quantity
        quantityInput.value = 1;
        
        // Show modal
        productModal.classList.add('active');
    }

    // Load cart
    function loadCart() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        cartItems.innerHTML = '<p class="loading">Loading cart...</p>';
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
        cartItems.innerHTML = '';
        
        if (!userCart.items || userCart.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            cartSubtotal.textContent = '₱0.00';
            checkoutBtn.disabled = true;
            return;
        }
        
        let subtotal = 0;
        
        userCart.items.forEach(item => {
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
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
        // Find item in cart
        const itemIndex = userCart.items.findIndex(item => item.product_id == productId);
        if (itemIndex === -1) return;
        
        // Update quantity
        userCart.items[itemIndex].quantity = quantity;
        
        // Save updated cart
        carts[userId] = userCart;
        localStorage.setItem('carts', JSON.stringify(carts));
        
        // Refresh cart display
        loadCart();
        updateCartCount();
        showNotification('Cart updated successfully', 'success');
    }

    // Remove cart item
    function removeCartItem(productId) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
        // Remove item from cart
        userCart.items = userCart.items.filter(item => item.product_id != productId);
        
        // Save updated cart
        carts[userId] = userCart;
        localStorage.setItem('carts', JSON.stringify(carts));
        
        // Refresh cart display
        loadCart();
        updateCartCount();
        showNotification('Item removed from cart', 'success');
    }

    // Add to cart
    function addToCart(productId, quantity) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            showNotification('Please login to add items to your cart', 'error');
            productModal.classList.remove('active');
            loginModal.classList.add('active');
            return;
        }
        
        // Get product details
        const product = staticProducts.find(p => p.product_id == productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }
        
        // Get cart from localStorage
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        const userCart = carts[userId] || { items: [] };
        
        // Check if product already in cart
        const existingItemIndex = userCart.items.findIndex(item => item.product_id == productId);
        
        if (existingItemIndex !== -1) {
            // Update quantity if already in cart
            userCart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            userCart.items.push({
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: quantity
            });
        }
        
        // Save updated cart
        carts[userId] = userCart;
        localStorage.setItem('carts', JSON.stringify(carts));
        
        showNotification('Item added to cart successfully', 'success');
        productModal.classList.remove('active');
        updateCartCount();
    }

    // Checkout
    function checkout() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            showNotification('Please login to checkout', 'error');
            return;
        }
        
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

    // Handle logout
    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        showNotification('Logged out successfully!', 'success');
        window.location.reload();
    }

    // Show login modal
    function showLoginModal(e) {
        e.preventDefault();
        loginModal.classList.add('active');
    }

    // Show signup modal
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (signupBtn.classList.contains('logout-btn')) {
            // Handle logout
            return;
        }
        signupModal.classList.add('active');
    });

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
            cartModal.classList.remove('active');
            productModal.classList.remove('active');
        });
    });

    // Switch between login and signup
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
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

    // Quantity controls
    decreaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    increaseQuantityBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        const maxValue = parseInt(quantityInput.getAttribute('max'));
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
        }
    });

    // Add to cart button
    addToCartBtn.addEventListener('click', function() {
        if (!currentProduct) return;
        
        const quantity = parseInt(quantityInput.value);
        addToCart(currentProduct.product_id, quantity);
    });

    // Cart icon click
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Please login to view your cart');
            loginModal.classList.add('active');
            return;
        }
        
        loadCart();
        cartModal.classList.add('active');
    });

    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        checkout();
    });

    // Shop link and CTA button
    shopLink.addEventListener('click', function(e) {
        // No need to prevent default since we're using a proper link now
        // e.preventDefault();
        // No need to scroll to products section since we're navigating to shop.html
        // document.querySelector('.featured-products').scrollIntoView({ behavior: 'smooth' });
    });

    shopCta.addEventListener('click', function(e) {
        // No need to prevent default since we're using a proper link now
        // e.preventDefault();
        // No need to scroll to products section since we're navigating to shop.html
        // document.querySelector('.featured-products').scrollIntoView({ behavior: 'smooth' });
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
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
            
            // Close modal
            loginModal.classList.remove('active');
            
            // Show success message
            showNotification('Login successful!', 'success');
            
            // Refresh page or update UI
            window.location.reload();
        })
        .catch(error => {
            // Handle error
            showNotification(error.message, 'error');
            console.error('Login error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        
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
            
            // Show success message
            showNotification('Account created successfully! You are now logged in.', 'success');
            
            // Refresh page or update UI
            window.location.reload();
        })
        .catch(error => {
            // Handle error
            showNotification(error.message, 'error');
            console.error('Registration error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        if (e.target === signupModal) {
            signupModal.classList.remove('active');
        }
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
        if (e.target === productModal) {
            productModal.classList.remove('active');
        }
    });

    // Initialize the app
    checkAuthStatus();
    loadProducts();
});
