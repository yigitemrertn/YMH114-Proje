document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Functionality
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

    // Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');

    // Function to apply theme
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');

            // Update theme radio button in appearance settings if it exists
            const themeDarkRadio = document.getElementById('theme-dark');
            if (themeDarkRadio) {
                themeDarkRadio.checked = true;
            }
        } else {
            document.body.classList.remove('dark-mode');
            icon.classList.replace('fa-sun', 'fa-moon');

            // Update theme radio button in appearance settings if it exists
            const themeLightRadio = document.getElementById('theme-light');
            if (themeLightRadio) {
                themeLightRadio.checked = true;
            }
        }
    }

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        applyTheme(true);
    }

    // Listen for theme changes from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            applyTheme(e.newValue === 'dark');
        }
    });

    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');

        if (isDark) {
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    // Settings Menu Functionality
    const settingsMenuItems = document.querySelectorAll('.settings-menu li');
    const settingsSections = document.querySelectorAll('.settings-section');

    // Function to switch active setting section
    function switchSettingsSection(targetId) {
        // Hide all sections
        settingsSections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all menu items
        settingsMenuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show the target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to the clicked menu item
        const activeMenuItem = document.querySelector(`.settings-menu li[data-target="${targetId}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
    }

    // Add click event to menu items
    settingsMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            switchSettingsSection(targetId);
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
                if (this.value === 'dark') {
                    applyTheme(true);
                } else if (this.value === 'light') {
                    applyTheme(false);
                } else if (this.value === 'system') {
                    // Check system preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    applyTheme(prefersDark);
                    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');

                    // Listen for system theme changes
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                        if (document.getElementById('theme-system').checked) {
                            applyTheme(e.matches);
                            localStorage.setItem('theme', e.matches ? 'dark' : 'light');
                        }
                    });
                }
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
                        window.location.href = 'index.html';
                    }, 2000);
                }
            }
        });
    }
});
