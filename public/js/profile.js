document.addEventListener('DOMContentLoaded', function() {
    // Get user ID from URL if viewing another user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    // Load profile data
    loadProfile(userId);

    // Follow button click handler
    const followButton = document.getElementById('follow-button');
    if (followButton) {
        followButton.addEventListener('click', function() {
            toggleFollow(userId);
        });
    }

    // Profile Menu Tab Switching
    const profileMenuItems = document.querySelectorAll('.profile-menu-item');
    const profileSections = document.querySelectorAll('.profile-section');

    profileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items and sections
            profileMenuItems.forEach(i => i.classList.remove('active'));
            profileSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked menu item
            this.classList.add('active');

            // Show corresponding section
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
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
});

function loadProfile(userId) {
    const endpoint = userId ? `api/user/get-user-profile.php?id=${userId}` : 'api/user/get-profile.php';

    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                updateProfileUI(data);
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            showError('Profil yüklenirken bir hata oluştu: ' + error.message);
            console.error('Error:', error);
        });
}

function updateProfileUI(data) {
    const { profile, recentPosts, recentComments } = data;

    // Update profile header
    document.getElementById('profile-username').textContent = '@' + profile.username;
    document.getElementById('profile-name').textContent = profile.full_name || profile.username;
    document.getElementById('profile-bio').textContent = profile.bio || 'Henüz bir biyografi eklenmemiş.';

    // Update profile stats
    document.getElementById('post-count').textContent = profile.post_count;
    document.getElementById('comment-count').textContent = profile.comment_count;
    document.getElementById('following-count').textContent = profile.following_count;
    document.getElementById('followers-count').textContent = profile.followers_count;

    // Update avatar
    const avatar = document.getElementById('profile-avatar');
    if (profile.avatar) {
        avatar.src = profile.avatar;
    } else {
        avatar.src = 'images/default-avatar.png';
    }

    // Update follow button
    const followButton = document.getElementById('follow-button');
    if (followButton) {
        if (profile.is_following) {
            followButton.textContent = 'Takibi Bırak';
            followButton.classList.add('following');
        } else {
            followButton.textContent = 'Takip Et';
            followButton.classList.remove('following');
        }
    }

    // Update recent posts
    const postsContainer = document.getElementById('recent-posts');
    if (postsContainer) {
        if (recentPosts && recentPosts.length > 0) {
            postsContainer.innerHTML = recentPosts.map(post => `
                <div class="post-card">
                    <h3><a href="post.html?id=${post.id}">${post.title}</a></h3>
                    <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-stats">
                        <span><i class="fas fa-heart"></i> ${post.like_count}</span>
                        <span><i class="fas fa-comment"></i> ${post.comment_count}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(post.created_at)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            postsContainer.innerHTML = '<p class="text-center">Henüz gönderi yok.</p>';
        }
    }

    // Update recent comments
    const commentsContainer = document.getElementById('recent-comments');
    if (commentsContainer) {
        if (recentComments && recentComments.length > 0) {
            commentsContainer.innerHTML = recentComments.map(comment => `
                <div class="comment-card">
                    <p>${comment.content}</p>
                    <div class="comment-meta">
                        <a href="post.html?id=${comment.post_id}">${comment.post_title}</a>
                        <span><i class="fas fa-clock"></i> ${formatDate(comment.created_at)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            commentsContainer.innerHTML = '<p class="text-center">Henüz yorum yok.</p>';
        }
    }
}

function toggleFollow(userId) {
    if (!userId) return;

    const formData = new FormData();
    formData.append('userId', userId);

    fetch('api/user/toggle-follow.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            loadProfile(userId);
            showSuccess(data.message);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        showError('İşlem sırasında bir hata oluştu: ' + error.message);
        console.error('Error:', error);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours === 0) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} dakika önce`;
        }
        return `${hours} saat önce`;
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} gün önce`;
    }

    // Otherwise show full date
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

