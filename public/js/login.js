document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    loginButton.addEventListener('click', function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        fetch('/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                rememberMe: rememberMe
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Başarılı giriş
                localStorage.setItem('username', data.username);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Avatar ayarlama
                if (data.avatar) {
                    localStorage.setItem('userAvatar', data.avatar);
                } else {
                    setDefaultAvatar(data.username);
                }
                
                if(data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.href = '../index.html';
                }
            } else {
                // Hata mesajını göster
                alert(data.message || 'Giriş başarısız');
            }
        })
        .catch(error => {
            alert(error.message);
        });
    });
});