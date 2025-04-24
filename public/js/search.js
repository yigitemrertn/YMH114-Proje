document.addEventListener('DOMContentLoaded', function() {
    // Search dropdown functionality
    const searchButtonMobile = document.querySelector('.search-button-mobile');
    const searchDropdown = document.querySelector('.search-dropdown');
    
    if (searchButtonMobile && searchDropdown) {
        searchButtonMobile.addEventListener('click', function() {
            searchDropdown.classList.toggle('active');
            // Focus on the search input when the dropdown is opened
            if (searchDropdown.classList.contains('active')) {
                document.getElementById('search-input-mobile').focus();
            }
        });
        
        // Close the search dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!searchButtonMobile.contains(event.target) && 
                !searchDropdown.contains(event.target)) {
                searchDropdown.classList.remove('active');
            }
        });
        
        // Close the search dropdown when pressing Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                searchDropdown.classList.remove('active');
            }
        });
    }
});