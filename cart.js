// Global cart functionality
const API_URL = 'http://localhost:8080';

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
});

function initializeCart() {
    console.log('Initializing cart functionality');
    
    // Update cart count
    updateCartCount();
    
    // Set up cart icon click handler
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        // Remove any existing event listeners
        cartIcon.replaceWith(cartIcon.cloneNode(true));
        
        // Get the fresh reference
        const freshCartIcon = document.querySelector('.cart-icon');
        
        freshCartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Please login to view your cart', 'error');
                showModal('loginModal');
                return;
            }
            
            // If there's a cart modal, load and show it
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                loadCart();
                cartModal.classList.add('active');
            } else {
                // If no cart modal on this page, redirect to shop page
                window.location.href = 'shop.html#cart';
            }
        });
    }
    
    // Set up checkout button if it exists
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            window.location.href = 'checkout.html';
        });
    }
    
    // Set up close buttons for modals
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.form-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('form-modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Update cart count badge
function updateCartCount() {
    const token = localStorage.getItem('token');
    const cartCount = document.querySelector('.cart-count');
    
    if (!token || !cartCount) return;
    
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

// Load cart contents
function loadCart() {
    const token = localStorage.getItem('token');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!token || !cartItems) return;
    
    // Show loading state
    cartItems.innerHTML = '<p class="loading-message">Loading cart...</p>';
    
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
            if (cartSubtotal) cartSubtotal.textContent = '₱0.00';
            if (checkoutBtn) checkoutBtn.disabled = true;
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
        });
        
        // Add event listeners for cart item buttons
        document.querySelectorAll('.cart-item .decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const currentQuantity = parseInt(this.nextElementSibling.textContent);
                updateCartItemQuantity(productId, currentQuantity - 1);
            });
        });
        
        document.querySelectorAll('.cart-item .increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const currentQuantity = parseInt(this.previousElementSibling.textContent);
                updateCartItemQuantity(productId, currentQuantity + 1);
            });
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                removeCartItem(productId);
            });
        });
        
        if (cartSubtotal) cartSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.disabled = false;
    })
    .catch(error => {
        console.error('Load cart error:', error);
        cartItems.innerHTML = '<p class="error-message">Failed to load cart. Please try again.</p>';
    });
}

// Update cart item quantity
function updateCartItemQuantity(productId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    if (quantity <= 0) {
        removeCartItem(productId);
        return;
    }
    
    fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: parseInt(productId),
            quantity: quantity
        })
    })
    .then(response => {
        if (!response.ok) {
            // Try alternative endpoint if first one fails
            return fetch(`${API_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    quantity: quantity
                })
            });
        }
        return response;
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
        showNotification('Failed to update cart. Please try again.', 'error');
    });
}

// Remove cart item
function removeCartItem(productId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // First try setting quantity to 0
    fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: parseInt(productId),
            quantity: 0
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
        showNotification('Failed to remove item. Please try again.', 'error');
    });
}

// Add to cart function for product pages
function addToCart(productId, quantity) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showNotification('Please login to add items to cart', 'error');
        showModal('loginModal');
        return;
    }
    
    fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: parseInt(productId),
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
        updateCartCount();
    })
    .catch(error => {
        console.error('Add to cart error:', error);
        showNotification('Failed to add item to cart. Please try again.', 'error');
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

// Helper function to show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Make these functions available globally
window.updateCartCount = updateCartCount;
window.loadCart = loadCart;
window.addToCart = addToCart;
window.showNotification = showNotification;
window.showModal = showModal;
window.removeCartItem = removeCartItem;
window.updateCartItemQuantity = updateCartItemQuantity; 