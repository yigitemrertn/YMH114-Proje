document.addEventListener('DOMContentLoaded', function() {
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

    // Registration form submission
    const registerButton = document.getElementById('register-login-button');

    if (registerButton) {
        registerButton.addEventListener('click', async (e) => {
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
    }
});