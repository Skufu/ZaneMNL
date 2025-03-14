document.addEventListener('DOMContentLoaded', function() {
    // Get login form elements
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const signupModal = document.getElementById('signupModal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const closeBtns = document.querySelectorAll('.close-btn');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Show login modal when login button is clicked
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('active');
    });
    
    // Show signup modal when signup button is clicked
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.add('active');
    });
    
    // Switch between login and signup forms
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
    
    // Close modals when close button is clicked
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
        });
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
    
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Login successful
            // Store user data and token in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Show success notification
            showNotification('Login successful!', 'success');
            
            // Close the login modal
            loginModal.classList.remove('active');
            
            // Update UI to show logged in state
            updateUIAfterLogin(data.user);
            
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
    
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async function(e) {
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
        
        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Registration successful
            showNotification('Registration successful! Please log in.', 'success');
            
            // Switch to login modal
            signupModal.classList.remove('active');
            loginModal.classList.add('active');
            
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
    
    // Check if user is already logged in
    function checkLoginStatus() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        if (user && token) {
            updateUIAfterLogin(user);
        }
    }
    
    // Update UI after login
    function updateUIAfterLogin(user) {
        // Hide login/signup buttons
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        
        // Create logout button if it doesn't exist
        if (!document.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            
            // Add logout functionality
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Clear user data and token
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                
                // Show login/signup buttons
                loginBtn.style.display = 'inline-block';
                signupBtn.style.display = 'inline-block';
                
                // Remove logout button
                this.remove();
                
                showNotification('Logged out successfully', 'success');
            });
            
            // Add to nav buttons
            document.querySelector('.nav-buttons').appendChild(logoutBtn);
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
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
    
    // Check login status on page load
    checkLoginStatus();
}); 