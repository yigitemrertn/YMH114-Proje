// Hamburger Menu Functionality
function initHamburgerMenu() {
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon'); // Optional element

    if (hamburgerButton && hamburgerMenu) {
        hamburgerButton.addEventListener('click', function() {
            hamburgerButton.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
            if (hamburgerIcon) hamburgerIcon.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!hamburgerButton.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                hamburgerButton.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                if (hamburgerIcon) hamburgerIcon.classList.remove('active');
            }
        });
    }
}

// Export the function so it can be used in other files
document.addEventListener('DOMContentLoaded', initHamburgerMenu); // Ensure DOM is fully loaded
