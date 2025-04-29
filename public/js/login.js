document.addEventListener('DOMContentLoaded', () => {
    // Form Validation and Submission
    const loginForm = document.querySelector('.input-container');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                alert('Giriş başarılı!');
                window.location.href = 'index.html';
            } else {
                alert('Giriş başarısız!');
            }
        });
    }
});