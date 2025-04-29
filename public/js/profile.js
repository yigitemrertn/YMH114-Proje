document.addEventListener('DOMContentLoaded', function() {
    // Profile Menu Tab Switching
    const profileMenuItems = document.querySelectorAll('.profile-menu li');
    const profileSections = document.querySelectorAll('.profile-section');

    // Function to switch active profile section
    function switchProfileSection(targetId) {
        // Hide all sections
        profileSections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all menu items
        profileMenuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show the target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to the clicked menu item
        const activeMenuItem = document.querySelector(`.profile-menu li[data-target="${targetId}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
    }

    // Add click event to menu items
    profileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            switchProfileSection(targetId);
        });
    });

    // Post Interaction Functionality
    const postActions = document.querySelectorAll('.post-action');
    
    postActions.forEach(action => {
        action.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            // Handle like action
            if (icon.classList.contains('fa-heart')) {
                if (icon.classList.contains('far')) {
                    // Like the post
                    icon.classList.replace('far', 'fas');
                    icon.style.color = '#e74c3c';
                    if (countSpan) {
                        let count = parseInt(countSpan.textContent);
                        countSpan.textContent = count + 1;
                    }
                } else {
                    // Unlike the post
                    icon.classList.replace('fas', 'far');
                    icon.style.color = '';
                    if (countSpan) {
                        let count = parseInt(countSpan.textContent);
                        countSpan.textContent = count - 1;
                    }
                }
            }
            
            // Handle retweet action
            if (icon.classList.contains('fa-retweet')) {
                if (!icon.style.color || icon.style.color === '') {
                    // Retweet the post
                    icon.style.color = '#2ecc71';
                    if (countSpan) {
                        let count = parseInt(countSpan.textContent);
                        countSpan.textContent = count + 1;
                    }
                } else {
                    // Undo retweet
                    icon.style.color = '';
                    if (countSpan) {
                        let count = parseInt(countSpan.textContent);
                        countSpan.textContent = count - 1;
                    }
                }
            }
        });
    });

    // New Post Functionality
    const newPostForm = document.querySelector('.new-post-form');
    const newPostTextarea = document.querySelector('.new-post-input textarea');
    const postButton = document.querySelector('.post-button');
    const postsContainer = document.querySelector('.posts-container');

    if (newPostForm && postButton && postsContainer) {
        postButton.addEventListener('click', function() {
            const postText = newPostTextarea.value.trim();
            
            if (postText) {
                // Create new post element
                const newPost = document.createElement('div');
                newPost.className = 'post-item';
                
                // Get current date and time
                const now = new Date();
                const timeString = 'şimdi';
                
                // Create post HTML
                newPost.innerHTML = `
                    <div class="post-avatar">
                        <img src="https://via.placeholder.com/50" alt="Profil Resmi">
                    </div>
                    <div class="post-content">
                        <div class="post-header">
                            <span class="post-name">Kullanıcı Adı</span>
                            <span class="post-username">@kullanici</span>
                            <span class="post-time">· ${timeString}</span>
                        </div>
                        <div class="post-text">
                            <p>${postText}</p>
                        </div>
                        <div class="post-actions">
                            <button class="post-action">
                                <i class="far fa-comment"></i>
                                <span>0</span>
                            </button>
                            <button class="post-action">
                                <i class="fas fa-retweet"></i>
                                <span>0</span>
                            </button>
                            <button class="post-action">
                                <i class="far fa-heart"></i>
                                <span>0</span>
                            </button>
                            <button class="post-action">
                                <i class="far fa-share-square"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add the new post to the beginning of the posts container
                postsContainer.insertBefore(newPost, postsContainer.firstChild);
                
                // Clear the textarea
                newPostTextarea.value = '';
                
                // Add event listeners to the new post's action buttons
                const newPostActions = newPost.querySelectorAll('.post-action');
                newPostActions.forEach(action => {
                    action.addEventListener('click', function() {
                        const icon = this.querySelector('i');
                        const countSpan = this.querySelector('span');
                        
                        // Handle like action
                        if (icon.classList.contains('fa-heart')) {
                            if (icon.classList.contains('far')) {
                                // Like the post
                                icon.classList.replace('far', 'fas');
                                icon.style.color = '#e74c3c';
                                if (countSpan) {
                                    let count = parseInt(countSpan.textContent);
                                    countSpan.textContent = count + 1;
                                }
                            } else {
                                // Unlike the post
                                icon.classList.replace('fas', 'far');
                                icon.style.color = '';
                                if (countSpan) {
                                    let count = parseInt(countSpan.textContent);
                                    countSpan.textContent = count - 1;
                                }
                            }
                        }
                        
                        // Handle retweet action
                        if (icon.classList.contains('fa-retweet')) {
                            if (!icon.style.color || icon.style.color === '') {
                                // Retweet the post
                                icon.style.color = '#2ecc71';
                                if (countSpan) {
                                    let count = parseInt(countSpan.textContent);
                                    countSpan.textContent = count + 1;
                                }
                            } else {
                                // Undo retweet
                                icon.style.color = '';
                                if (countSpan) {
                                    let count = parseInt(countSpan.textContent);
                                    countSpan.textContent = count - 1;
                                }
                            }
                        }
                    });
                });
            }
        });
    }

    // Follow Button Functionality
    const followButtons = document.querySelectorAll('.follow-button');
    
    followButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent === 'Takip Et') {
                this.textContent = 'Takip Ediliyor';
                this.style.backgroundColor = '#2ecc71';
            } else {
                this.textContent = 'Takip Et';
                this.style.backgroundColor = '';
            }
        });
    });
});