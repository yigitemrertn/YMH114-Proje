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

    // Initialize profile menu functionality
    initializeProfileMenu();
    setupProfileInteractions();
    loadProfileData();
    initializePageHandlers();
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

// Initialize profile menu functionality
function initializeProfileMenu() {
    const menuItems = document.querySelectorAll('.profile-menu-item');
    const sections = document.querySelectorAll('.profile-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all menu items and sections
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Show corresponding section
            const targetSectionElement = document.getElementById(targetSection + '-section');
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
            }
        });
    });
}

// Setup profile interactions
function setupProfileInteractions() {
    // Follow button functionality
    const followButton = document.getElementById('followButton');
    if (followButton) {
        followButton.addEventListener('click', function() {
            const isFollowing = this.classList.contains('following');
            
            if (isFollowing) {
                this.innerHTML = '<i class="fas fa-user-plus"></i> Takip Et';
                this.classList.remove('following');
                this.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                
                // Update follower count
                const followerCount = document.getElementById('followerCount');
                if (followerCount) {
                    const currentCount = parseInt(followerCount.textContent);
                    followerCount.textContent = currentCount - 1;
                }
            } else {
                this.innerHTML = '<i class="fas fa-user-check"></i> Takip Ediliyor';
                this.classList.add('following');
                this.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                
                // Update follower count
                const followerCount = document.getElementById('followerCount');
                if (followerCount) {
                    const currentCount = parseInt(followerCount.textContent);
                    followerCount.textContent = currentCount + 1;
                }
            }
        });
    }

    // Post action buttons
    setupPostActions();
}

// Setup post action functionality
function setupPostActions() {
    const postActions = document.querySelectorAll('.post-action');
    
    postActions.forEach(action => {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            if (icon.classList.contains('fa-heart')) {
                // Like functionality
                if (icon.style.color === 'rgb(231, 76, 60)') {
                    // Unlike
                    icon.style.color = '';
                    if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent);
                        countSpan.textContent = currentCount - 1;
                    }
                } else {
                    // Like
                    icon.style.color = '#e74c3c';
                    if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent);
                        countSpan.textContent = currentCount + 1;
                    }
                }
            } else if (icon.classList.contains('fa-comment')) {
                // Comment functionality - could open a modal or navigate to post detail
                console.log('Comment clicked');
            } else if (icon.classList.contains('fa-share')) {
                // Share functionality
                if (navigator.share) {
                    navigator.share({
                        title: 'Forum Gönderisi',
                        text: 'Bu gönderiyi kontrol et!',
                        url: window.location.href
                    });
                } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        showNotification('Bağlantı panoya kopyalandı!');
                    });
                }
            }
        });
    });
}

// Load profile data (this would typically come from an API)
function loadProfileData() {
    // Simulate loading profile data
    // In a real application, this would fetch data from a server
    
    const profileData = {
        name: 'Kullanıcı Adı',
        username: '@kullanici',
        bio: 'Bu kullanıcının henüz bir biyografisi bulunmuyor.',
        postCount: 42,
        followerCount: 128,
        followingCount: 89,
        avatar: 'images/default-avatar.png',
        joinDate: 'Ocak 2024',
        location: 'İstanbul, Türkiye',
        website: 'example.com'
    };

    // Update profile elements with data
    updateProfileDisplay(profileData);
    
    // Load posts
    loadUserPosts();
}

// Update profile display with data
function updateProfileDisplay(data) {
    const elements = {
        profileName: document.getElementById('profileName'),
        profileUsername: document.getElementById('profileUsername'),
        profileBio: document.getElementById('profileBio'),
        postCount: document.getElementById('postCount'),
        followerCount: document.getElementById('followerCount'),
        followingCount: document.getElementById('followingCount'),
        avatarImage: document.getElementById('avatarImage')
    };

    // Update elements if they exist
    Object.keys(elements).forEach(key => {
        const element = elements[key];
        const dataKey = key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toLowerCase()).replace(/ /g, '');
        if (element && data[dataKey]) {
            if (key === 'avatarImage') {
                element.src = data.avatar;
            } else {
                element.textContent = data[dataKey];
            }
        }
    });
}

// Load user posts (simulated)
function loadUserPosts() {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) return;

    // Sample posts data
    const posts = [
        {
            id: 2,
            content: 'Forum platformlarında kullanıcı deneyimi çok önemli. İyi bir arayüz tasarımı kullanıcıların platformda daha çok zaman geçirmesini sağlar.',
            likes: 25,
            comments: 8,
            time: '1s',
            avatar: 'images/default-avatar.png'
        },
        {
            id: 3,
            content: 'JavaScript ile dinamik web sayfaları oluşturmak gerçekten eğlenceli! Özellikle modern framework\'lerle birlikte.',
            likes: 18,
            comments: 5,
            time: '3s',
            avatar: 'images/default-avatar.png'
        }
    ];

    // Add new posts to existing container
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    postDiv.innerHTML = `
        <div class="post-avatar">
            <img src="${post.avatar}" alt="User Avatar">
        </div>
        <div class="post-content">
            <div class="post-header">
                <span class="post-name">Kullanıcı Adı</span>
                <span class="post-username">@kullanici</span>
                <span class="post-time">• ${post.time}</span>
            </div>
            <div class="post-text">
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <button class="post-action">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="post-action">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments}</span>
                </button>
                <button class="post-action">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listeners to the new post actions
    const postActions = postDiv.querySelectorAll('.post-action');
    postActions.forEach(action => {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            if (icon.classList.contains('fa-heart')) {
                // Like functionality
                if (icon.style.color === 'rgb(231, 76, 60)') {
                    // Unlike
                    icon.style.color = '';
                    if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent);
                        countSpan.textContent = currentCount - 1;
                    }
                } else {
                    // Like
                    icon.style.color = '#e74c3c';
                    if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent);
                        countSpan.textContent = currentCount + 1;
                    }
                }
            }
        });
    });

    return postDiv;
}

// Show notification (utility function)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize page handlers
function initializePageHandlers() {
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add click handlers for profile posts
    document.addEventListener('click', function(e) {
        const postItem = e.target.closest('.post-item');
        if (postItem && !e.target.closest('.post-action')) {
            // Could navigate to detailed post view
            console.log('Post clicked:', postItem);
        }
    });
}

