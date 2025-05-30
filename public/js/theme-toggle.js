/**
 * Theme Toggle Functionality
 * This script handles the dark/light mode toggle functionality.
 * It saves the user's preference to localStorage and applies it across page loads.
 */

function initThemeToggle() {
    // Get the theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');

    // Exit if the theme toggle button doesn't exist
    if (!themeToggle) return;

    // Get the icon inside the theme toggle button
    const icon = themeToggle.querySelector('i');

    /**
     * Apply the theme based on the isDark parameter
     * @param {boolean} isDark - Whether to apply dark mode
     */
    function applyTheme(isDark) {
        if (isDark) {
            // Apply dark mode
            document.body.classList.add('dark-mode');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');

            // Update the theme radio button in appearance settings if it exists
            const themeDarkRadio = document.getElementById('theme-dark');
            if (themeDarkRadio) {
                themeDarkRadio.checked = true;
            }
        } else {
            // Apply light mode
            document.body.classList.remove('dark-mode');
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');

            // Update the theme radio button in appearance settings if it exists
            const themeLightRadio = document.getElementById('theme-light');
            if (themeLightRadio) {
                themeLightRadio.checked = true;
            }
        }
    }

    /**
     * Initialize the theme based on the user's saved preference
     * or system preference if no saved preference exists
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            applyTheme(true);
        } else if (savedTheme === 'light') {
            applyTheme(false);
        } else {
            // If no saved preference, check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDarkMode);
            localStorage.setItem('theme', prefersDarkMode ? 'dark' : 'light');
        }
    }

    // Initialize the theme when the page loads
    initTheme();

    // Listen for theme changes from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            applyTheme(e.newValue === 'dark');
        }
    });

    // Toggle the theme when the theme toggle button is clicked
    themeToggle.addEventListener('click', function() {
        const isDark = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Update the icon
        if (icon) {
            if (isDark) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        }
    });
}

// Initialize the theme toggle when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initThemeToggle);
