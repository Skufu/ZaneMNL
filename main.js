document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const carouselPrevBtn = document.querySelector('.prev-btn');
    const carouselNextBtn = document.querySelector('.next-btn');
    const productCarousel = document.querySelector('.product-carousel');

    // Show login modal
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('active');
    });

    // Show signup modal
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.add('active');
    });

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
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

    // Product carousel functionality
    let scrollPosition = 0;
    const cardWidth = 330; // card width + margin
    const maxScroll = -(productCarousel.scrollWidth - productCarousel.clientWidth);

    carouselNextBtn.addEventListener('click', function() {
        scrollPosition = Math.max(maxScroll, scrollPosition - cardWidth);
        productCarousel.style.transform = `translateX(${scrollPosition}px)`;
        updateCarouselButtons();
    });

    carouselPrevBtn.addEventListener('click', function() {
        scrollPosition = Math.min(0, scrollPosition + cardWidth);
        productCarousel.style.transform = `translateX(${scrollPosition}px)`;
        updateCarouselButtons();
    });

    function updateCarouselButtons() {
        carouselPrevBtn.style.opacity = scrollPosition === 0 ? '0.3' : '1';
        carouselNextBtn.style.opacity = scrollPosition <= maxScroll ? '0.3' : '1';
    }

    // Initial button state
    updateCarouselButtons();

    // Form submission with MySQL encoding
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Create request payload
        const payload = {
            email: email,
            password: password
        };
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        // Send request to backend
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Handle successful login
            console.log('Login successful:', data);
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Close modal
            loginModal.classList.remove('active');
            
            // Refresh page or update UI
            window.location.reload();
        })
        .catch(error => {
            // Handle error
            alert(error.message);
            console.error('Login error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Create request payload
        const payload = {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        
        // Send request to backend
        fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Signup failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Handle successful signup
            console.log('Signup successful:', data);
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Close modal
            signupModal.classList.remove('active');
            
            // Show success message
            alert('Account created successfully!');
            
            // Refresh page or update UI
            window.location.reload();
        })
        .catch(error => {
            // Handle error
            alert(error.message);
            console.error('Signup error:', error);
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
    });
});
