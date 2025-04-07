document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Functionality
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon');

    hamburgerButton.addEventListener('click', () => {
        hamburgerButton.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
        hamburgerIcon.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerButton.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            hamburgerButton.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            hamburgerIcon.classList.remove('active');
        }
    });

    // Dark Mode Functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Function to apply theme
    function applyTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme === 'dark');
    }

    // Listen for theme changes from other tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            applyTheme(e.newValue === 'dark');
        }
    });

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Form Validation and Submission
    const loginForm = document.querySelector('.input-container');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Reset previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        let isValid = true;
        
        // Email validation
        if (!emailInput.value) {
            emailInput.parentElement.nextElementSibling.textContent = 'E-posta adresi gereklidir';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.parentElement.nextElementSibling.textContent = 'Geçerli bir e-posta adresi giriniz';
            isValid = false;
        }
        
        // Password validation
        if (!passwordInput.value) {
            passwordInput.parentElement.nextElementSibling.textContent = 'Şifre gereklidir';
            isValid = false;
        }
        
        if (isValid) {
            // Here you would typically send the login request to your backend
            console.log('Login attempt with:', {
                email: emailInput.value,
                password: passwordInput.value
            });
            
            // For demonstration, we'll just show a success message
            alert('Giriş başarılı!');
        }
    });
}); 