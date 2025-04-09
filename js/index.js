document.addEventListener('DOMContentLoaded', function() {
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

    // Dark Mode Toggle
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
});