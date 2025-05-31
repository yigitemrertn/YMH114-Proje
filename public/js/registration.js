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
    const emailInput = document.getElementById('email-input-box');
    const usernameInput = document.getElementById('username-input-box');
    const nameInput = document.getElementById('name-input-box');
    const surnameInput = document.getElementById('surname-input-box');

    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;
            const username = usernameInput.value;
            const name = nameInput.value;
            const surname = surnameInput.value;

            // Form validation
            if (!email || !password || !username || !name || !surname) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            fetch('/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    username: username,
                    name: name,
                    surname: surname
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                if (data.success) {
                    localStorage.setItem('loggedIn', 'true');
                    window.location.href = '/';
                }
            })
            .catch(error => {
                alert(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            });
        });
    }
});