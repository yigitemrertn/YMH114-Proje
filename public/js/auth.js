// Function to check login status and update UI
async function checkLoginStatus() {
    try {
        const response = await fetch('/status.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const authButtons = document.getElementById('authButtons');
        const hamburgerContainer = document.getElementById('hamburgerContainer');
        
        // Get current page path
        const currentPath = window.location.pathname;
        const isProtectedPage = currentPath.includes('profile.html') || currentPath.includes('settings.html');
        
        if (data.loggedIn) {
            if (authButtons) authButtons.style.display = 'none';
            if (hamburgerContainer) hamburgerContainer.style.display = 'block';
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (hamburgerContainer) hamburgerContainer.style.display = 'none';
            
            // If on a protected page and not logged in, redirect to login
            if (isProtectedPage) {
                window.location.href = '/login.html';
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        // If there's an error, assume not logged in for security
        const authButtons = document.getElementById('authButtons');
        const hamburgerContainer = document.getElementById('hamburgerContainer');
        if (authButtons) authButtons.style.display = 'flex';
        if (hamburgerContainer) hamburgerContainer.style.display = 'none';
    }
}

// Check login status when the page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus); 