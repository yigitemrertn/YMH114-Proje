document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation items and sections
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');

    // Add click event listener to each navigation item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');

            // Get the target section id from data-target attribute
            const targetId = this.getAttribute('data-target');

            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });

            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Profile Image Upload Preview
    const profileAvatarInput = document.getElementById('profile-avatar');
    const avatarPreview = document.getElementById('avatar-preview');

    if (profileAvatarInput && avatarPreview) {
        // Initialize from data attribute
        if (avatarPreview.dataset.imageUrl) {
            avatarPreview.style.backgroundImage = `url(${avatarPreview.dataset.imageUrl})`;
        }

        profileAvatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();

                reader.addEventListener('load', function() {
                    avatarPreview.style.backgroundImage = `url(${reader.result})`;
                    // Update data attribute for consistency
                    avatarPreview.dataset.imageUrl = reader.result;
                });

                reader.readAsDataURL(file);
            }
        });
    }

    // Password Strength Indicator
    const newPasswordInput = document.getElementById('new-password');
    const strengthBar = document.querySelector('.password-strength .strength-bar');

    if (newPasswordInput && strengthBar) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;

            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/\d/)) strength++;
            if (password.match(/[^a-zA-Z\d]/)) strength++;

            strengthBar.style.width = (strength * 25) + '%';

            // Remove all strength classes
            strengthBar.className = 'strength-bar';

            // Add appropriate strength class
            if (strength > 0) {
                strengthBar.classList.add('strength-' + strength);
            }
        });
    }

    // Font Size Range Slider
    const fontSizeSlider = document.getElementById('font-size');
    const rangeValue = document.querySelector('.range-value');

    if (fontSizeSlider && rangeValue) {
        // Update range value display
        fontSizeSlider.addEventListener('input', function() {
            rangeValue.textContent = this.value + 'px';
        });

        // Apply font size change
        fontSizeSlider.addEventListener('change', function() {
            document.documentElement.style.fontSize = this.value + 'px';
            localStorage.setItem('fontSize', this.value);
        });

        // Load saved font size
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            fontSizeSlider.value = savedFontSize;
            rangeValue.textContent = savedFontSize + 'px';
            document.documentElement.style.fontSize = savedFontSize + 'px';
        }
    }

    // Theme Options in Appearance Settings
    const themeOptions = document.querySelectorAll('input[name="theme"]');

    if (themeOptions.length > 0) {
        // Set initial value based on current theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        const themeRadio = document.getElementById(`theme-${currentTheme}`);
        if (themeRadio) {
            themeRadio.checked = true;
        }

        // Add change event to theme options
        themeOptions.forEach(option => {
            option.addEventListener('change', function() {
                const isDarkTheme = this.value === 'dark';
                localStorage.setItem('theme', this.value);

                // Dispatch a storage event so our theme-toggle.js can handle the theme change
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'theme',
                    newValue: this.value
                }));
            });
        });
    }

    // Form Submission Handling
    const settingsForms = document.querySelectorAll('.settings-form');

    settingsForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Create a FormData object to collect form data
            const formData = new FormData(this);
            const formObject = {};

            // Convert FormData to a regular object
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }

            // Log the form data (in a real app, you would send this to the server)
            console.log('Form submitted:', formObject);

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Ayarlar başarıyla kaydedildi!';

            // Add success message to the form
            this.appendChild(successMessage);

            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    });

    // Danger Zone Buttons
    const deactivateButton = document.getElementById('deactivate-account');
    const deleteButton = document.getElementById('delete-account');

    if (deactivateButton) {
        deactivateButton.addEventListener('click', function() {
            if (confirm('Hesabınızı devre dışı bırakmak istediğinizden emin misiniz? Bu işlem geri alınabilir.')) {
                alert('Hesabınız devre dışı bırakıldı. Tekrar giriş yaparak hesabınızı aktifleştirebilirsiniz.');
            }
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
                if (prompt('Bu işlemi onaylamak için "SİL" yazın:') === 'SİL') {
                    alert('Hesabınız silindi. Yönlendiriliyorsunuz...');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }
        });
    }
});