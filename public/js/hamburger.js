// Hamburger Menu Functionality
function initHamburgerMenu() {
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon'); // Optional element
    const logoutButton = document.querySelector('.logout-button');

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

    // Handle logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/logout.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Important for cookies
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // No need to clear localStorage or sessionStorage as we're using server-side sessions
                    // But clear them anyway just to be safe
                    localStorage.clear();
                    sessionStorage.clear();

                    // Redirect to login page after successful logout
                    window.location.href = '/login.html';
                } else {
                    console.error('Logout failed:', data.error || 'Unknown error');
                    alert('Failed to logout. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred during logout. Please try again.');
            }
        });
    }
}

// Export the function so it can be used in other files
document.addEventListener('DOMContentLoaded', initHamburgerMenu); // Ensure DOM is fully loaded
