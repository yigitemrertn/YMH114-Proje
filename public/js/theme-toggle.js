// Dark Mode Toggle Functionality
function initDarkMode() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    
    // Function to apply theme
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
            
            // Update theme radio button in appearance settings if it exists
            const themeDarkRadio = document.getElementById('theme-dark');
            if (themeDarkRadio) {
                themeDarkRadio.checked = true;
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
            
            // Update theme radio button in appearance settings if it exists
            const themeLightRadio = document.getElementById('theme-light');
            if (themeLightRadio) {
                themeLightRadio.checked = true;
            }
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
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    });
}

// Export the function so it can be used in other files
document.addEventListener('DOMContentLoaded', initDarkMode);