document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextBtns = document.querySelectorAll('.next-btn');
    const backBtns = document.querySelectorAll('.back-btn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const promoCodeInput = document.getElementById('promoCode');
    const applyPromoBtn = document.getElementById('applyPromo');
    const orderItems = document.getElementById('orderItems');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderShipping = document.getElementById('orderShipping');
    const orderTotal = document.getElementById('orderTotal');
    
    // API Base URL
    const API_URL = 'http://localhost:8080';
    
    // Checkout Steps
    const shippingForm = document.getElementById('shipping-form');
    const paymentForm = document.getElementById('payment-form');
    const reviewForm = document.getElementById('review-form');
    const confirmationForm = document.getElementById('confirmation-form');
    
    // Form Elements
    const shippingDetailsForm = document.getElementById('shipping-details-form');
    const paymentDetailsForm = document.getElementById('payment-details-form');
    const backToShippingBtn = document.getElementById('back-to-shipping');
    const backToPaymentBtn = document.getElementById('back-to-payment');
    const editShippingBtn = document.getElementById('edit-shipping');
    const editPaymentBtn = document.getElementById('edit-payment');
    
    // Payment Method Forms
    const creditCardForm = document.getElementById('credit-card-form');
    const gcashForm = document.getElementById('gcash-form');
    const paypalForm = document.getElementById('paypal-form');
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    
    // Shipping Method
    const shippingMethods = document.querySelectorAll('input[name="shipping-method"]');
    
    // Order Summary
    const summaryItems = document.getElementById('summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTotal = document.getElementById('summary-total');
    
    // Order Data
    let orderData = {
        shipping: {
            fullName: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            method: 'standard'
        },
        payment: {
            method: 'cod',
            details: {}
        },
        items: [],
        subtotal: 0,
        shipping_fee: 100,
        total: 0,
        promo_code: null,
        discount: 0
    };
    
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
                window.location.href = 'index.html';
            });
            
            // Add "View Orders" link if it doesn't exist
            if (!document.querySelector('.nav-links li a[href="view-orders.html"]')) {
                const orderLink = document.createElement('li');
                orderLink.innerHTML = '<a href="view-orders.html">My Orders</a>';
                navLinks.appendChild(orderLink);
            }
            
            // Update cart count
            updateCartCount();
            
            // Load order summary
            loadOrderSummary();
        } else {
            // User is not logged in
            loginBtn.textContent = 'Login';
            signupBtn.style.display = 'inline-block';
            
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
            
            // Remove "View Orders" link if it exists
            const orderLink = document.querySelector('.nav-links li a[href="view-orders.html"]');
            if (orderLink) {
                orderLink.parentElement.remove();
            }
            
            // Show login notification
            showNotification('Please log in to proceed with checkout', 'error');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 2000);
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
    
    // Load order summary
    function loadOrderSummary() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Show loading state
        orderItems.innerHTML = '<p class="loading">Loading cart...</p>';
        
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
            if (!data.items || data.items.length === 0) {
                showNotification('Your cart is empty', 'error');
                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 2000);
                return;
            }
            
            // Clear order items
            orderItems.innerHTML = '';
            
            // Calculate subtotal
            let subtotal = 0;
            
            // Store items in order data
            orderData.items = data.items;
            
            // Add items to order summary
            data.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">₱${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                        <div class="item-total">₱${itemTotal.toFixed(2)}</div>
                    </div>
                `;
                
                orderItems.appendChild(orderItem);
            });
            
            // Update order summary
            orderData.subtotal = subtotal;
            orderSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
            
            // Get shipping method
            const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'standard';
            const shipping = shippingMethod === 'express' ? 150 : 100;
            orderData.shipping_fee = shipping;
            orderShipping.textContent = `₱${shipping.toFixed(2)}`;
            
            // Calculate total
            const total = subtotal + shipping - orderData.discount;
            orderData.total = total;
            orderTotal.textContent = `₱${total.toFixed(2)}`;
            
            // Also update the review order items
            updateReviewOrderItems();
        })
        .catch(error => {
            console.error('Load order summary error:', error);
            orderItems.innerHTML = '<p class="error-message">Failed to load cart. Please try again.</p>';
        });
    }
    
    // Update review order items
    function updateReviewOrderItems() {
        const reviewOrderItems = document.getElementById('review-order-items');
        if (!reviewOrderItems) return;
        
        reviewOrderItems.innerHTML = '';
        
        orderData.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'review-item';
            orderItem.innerHTML = `
                <img src="${item.image_url || 'images/cap1.png'}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₱${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                    <div class="item-total">₱${itemTotal.toFixed(2)}</div>
                </div>
            `;
            
            reviewOrderItems.appendChild(orderItem);
        });
    }
    
    // Update shipping info in review
    function updateReviewShippingInfo() {
        const reviewShippingInfo = document.getElementById('review-shipping-info');
        if (!reviewShippingInfo) return;
        
        const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'standard';
        const methodText = shippingMethod === 'express' ? 'Express Shipping (1-2 business days)' : 'Standard Shipping (3-5 business days)';
        
        reviewShippingInfo.innerHTML = `
            <p><strong>${orderData.shipping.fullName}</strong></p>
            <p>${orderData.shipping.phone}</p>
            <p>${orderData.shipping.email}</p>
            <p>${orderData.shipping.address}</p>
            <p>${orderData.shipping.city}, ${orderData.shipping.province} ${orderData.shipping.postalCode}</p>
            <p><strong>Shipping Method:</strong> ${methodText}</p>
        `;
    }
    
    // Update payment info in review
    function updateReviewPaymentInfo() {
        const reviewPaymentInfo = document.getElementById('review-payment-info');
        if (!reviewPaymentInfo) return;
        
        let paymentDetails = '';
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
        
        switch (paymentMethod) {
            case 'cod':
                paymentDetails = 'Cash on Delivery';
                break;
            case 'gcash':
                const gcashNumber = document.getElementById('gcash-number')?.value || '';
                paymentDetails = `GCash (${gcashNumber})`;
                break;
            case 'paypal':
                const paypalEmail = document.getElementById('paypal-email')?.value || '';
                paymentDetails = `PayPal (${paypalEmail})`;
                break;
            case 'credit-card':
                const cardNumber = document.getElementById('card-number')?.value || '';
                const maskedNumber = cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : '';
                paymentDetails = `Credit Card (${maskedNumber})`;
                break;
        }
        
        reviewPaymentInfo.innerHTML = `
            <p><strong>Payment Method:</strong> ${paymentDetails}</p>
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
    
    // Place order
    function placeOrder() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;
        
        // Get shipping information from orderData
        const { fullName, phone, email, address, city, province, postalCode } = orderData.shipping;
        const paymentMethod = orderData.payment.method;
        
        // Validate shipping information
        if (!fullName || !phone || !email || !address || !city || !province || !postalCode) {
            showNotification('Please fill in all shipping information', 'error');
            return;
        }
        
        // Validate payment method
        if (!paymentMethod) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        // Show loading state
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Processing...';
        
        // Send checkout request to API
        fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shipping_address: {
                    full_name: fullName,
                    phone_number: phone,
                    address: address,
                    city: city,
                    province: province,
                    postal_code: postalCode
                },
                payment_method: paymentMethod
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to place order');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showNotification('Order placed successfully!', 'success');
            
            // Show confirmation step
            reviewForm.style.display = 'none';
            confirmationForm.style.display = 'block';
            
            // Update confirmation details
            document.getElementById('confirmation-order-number').textContent = `#${data.order_id}`;
            document.getElementById('confirmation-email').textContent = email;
            
            // Update step indicators
            steps.forEach(step => {
                step.classList.add('completed');
            });
            
            // Redirect to orders page after 5 seconds
            setTimeout(() => {
                window.location.href = 'view-orders.html';
            }, 5000);
        })
        .catch(error => {
            console.error('Place order error:', error);
            showNotification('Failed to place order. Please try again.', 'error');
            
            // Reset button state
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        });
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
    
    // Shipping form submission
    shippingDetailsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        orderData.shipping = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
            method: document.querySelector('input[name="shipping"]:checked')?.value || 'standard'
        };
        
        // Validate form data
        if (!orderData.shipping.fullName || !orderData.shipping.phone || !orderData.shipping.email || 
            !orderData.shipping.address || !orderData.shipping.city || !orderData.shipping.province || 
            !orderData.shipping.postalCode) {
            showNotification('Please fill in all shipping information', 'error');
            return;
        }
        
        // Move to payment step
        shippingForm.style.display = 'none';
        paymentForm.style.display = 'block';
        
        // Update step indicators
        steps[0].classList.add('completed');
        steps[1].classList.add('active');
    });
    
    // Payment form submission
    paymentDetailsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        // Store payment data
        orderData.payment.method = paymentMethod;
        
        // Get payment details based on method
        switch (paymentMethod) {
            case 'credit-card':
                orderData.payment.details = {
                    cardNumber: document.getElementById('card-number').value,
                    expiryDate: document.getElementById('expiry-date').value,
                    cvv: document.getElementById('cvv').value,
                    cardName: document.getElementById('card-name').value
                };
                break;
            case 'gcash':
                orderData.payment.details = {
                    gcashNumber: document.getElementById('gcash-number').value
                };
                break;
            case 'paypal':
                orderData.payment.details = {
                    paypalEmail: document.getElementById('paypal-email').value
                };
                break;
        }
        
        // Update review sections
        updateReviewShippingInfo();
        updateReviewPaymentInfo();
        updateReviewOrderItems();
        
        // Move to review step
        paymentForm.style.display = 'none';
        reviewForm.style.display = 'block';
        
        // Update step indicators
        steps[1].classList.add('completed');
        steps[2].classList.add('active');
    });
    
    // Back to shipping button
    backToShippingBtn.addEventListener('click', function() {
        paymentForm.style.display = 'none';
        shippingForm.style.display = 'block';
        
        // Update step indicators
        steps[1].classList.remove('active');
        steps[1].classList.remove('completed');
        steps[0].classList.add('active');
    });
    
    // Back to payment button
    backToPaymentBtn.addEventListener('click', function() {
        reviewForm.style.display = 'none';
        paymentForm.style.display = 'block';
        
        // Update step indicators
        steps[2].classList.remove('active');
        steps[2].classList.remove('completed');
        steps[1].classList.add('active');
    });
    
    // Edit shipping button
    editShippingBtn.addEventListener('click', function() {
        reviewForm.style.display = 'none';
        shippingForm.style.display = 'block';
        
        // Update step indicators
        steps[2].classList.remove('active');
        steps[2].classList.remove('completed');
        steps[1].classList.remove('active');
        steps[1].classList.remove('completed');
        steps[0].classList.add('active');
    });
    
    // Edit payment button
    editPaymentBtn.addEventListener('click', function() {
        reviewForm.style.display = 'none';
        paymentForm.style.display = 'block';
        
        // Update step indicators
        steps[2].classList.remove('active');
        steps[2].classList.remove('completed');
        steps[1].classList.add('active');
    });
    
    // Payment method change
    document.querySelectorAll('input[name="payment"]').forEach(input => {
        input.addEventListener('change', function() {
            // Hide all payment forms
            creditCardForm.style.display = 'none';
            gcashForm.style.display = 'none';
            paypalForm.style.display = 'none';
            
            // Show selected payment form
            if (this.value === 'credit-card') {
                creditCardForm.style.display = 'block';
            } else if (this.value === 'gcash') {
                gcashForm.style.display = 'block';
            } else if (this.value === 'paypal') {
                paypalForm.style.display = 'block';
            }
        });
    });
    
    // Shipping method change
    document.querySelectorAll('input[name="shipping"]').forEach(input => {
        input.addEventListener('change', function() {
            const shipping = this.value === 'express' ? 150 : 100;
            orderData.shipping_fee = shipping;
            orderData.shipping.method = this.value;
            
            // Update order summary
            orderShipping.textContent = `₱${shipping.toFixed(2)}`;
            
            // Recalculate total
            const total = orderData.subtotal + shipping - orderData.discount;
            orderData.total = total;
            orderTotal.textContent = `₱${total.toFixed(2)}`;
        });
    });
    
    // Apply promo code
    applyPromoBtn.addEventListener('click', function() {
        const code = promoCodeInput.value.trim();
        if (code === 'ZANE10') {
            // Apply 10% discount
            const subtotal = parseFloat(orderSubtotal.textContent.replace('₱', ''));
            const shipping = parseFloat(orderShipping.textContent.replace('₱', ''));
            const discount = subtotal * 0.1;
            const total = subtotal - discount + shipping;
            
            orderData.discount = discount;
            orderData.promo_code = code;
            orderData.total = total;
            
            orderTotal.textContent = `₱${total.toFixed(2)}`;
            showNotification('Promo code applied successfully!', 'success');
        } else {
            showNotification('Invalid promo code', 'error');
        }
    });
    
    // Place order button
    placeOrderBtn.addEventListener('click', placeOrder);
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
            
            loginModal.classList.remove('active');
            checkAuthStatus();
            showNotification('Login successful', 'success');
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Login error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
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
            
            signupModal.classList.remove('active');
            checkAuthStatus();
            showNotification('Signup successful', 'success');
        })
        .catch(error => {
            showNotification(error.message, 'error');
            console.error('Registration error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
    
    // Initialize
    checkAuthStatus();
}); 