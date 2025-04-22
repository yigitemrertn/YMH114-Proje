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

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Giriş başarılı!');
            window.location.href = 'index.html';
        } else {
            alert('Giriş başarısız!');
        }
    });
});