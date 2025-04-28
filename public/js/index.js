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
});