// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Functionality
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    
    hamburgerButton.addEventListener('click', function() {
        hamburgerButton.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
        if (!hamburgerButton.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            hamburgerButton.classList.remove('active');
            hamburgerMenu.classList.remove('active');
        }
    });

    // Password strength indicator
    const passwordInput = document.getElementById('password-input-box');
    const strengthBar = document.querySelector('.strength-bar');
    
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/\d/)) strength++;
            if (password.match(/[^a-zA-Z\d]/)) strength++;
            
            strengthBar.style.width = (strength * 25) + '%';
            strengthBar.className = 'strength-bar strength-' + strength;
        });
    }

    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Function to apply theme
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        applyTheme(true);
    }
    
    // Listen for theme changes from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            applyTheme(e.newValue === 'dark');
        }
    });
    
    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    document.getElementById('register-login-button').addEventListener('click', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name-input-box').value;
        const surname = document.getElementById('surname-input-box').value;
        const username = document.getElementById('username-input-box').value;
        const email = document.getElementById('email-input-box').value;
        const password = document.getElementById('password-input-box').value;

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, username, email, password })
        });

        if (response.ok) {
            alert('Kayıt başarılı!');
            window.location.href = 'login.html';
        } else {
            alert('Kayıt başarısız!');
        }
    });
});

