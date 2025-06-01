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

    // Menü tab switching güncellendi
    const profileMenuItems = document.querySelectorAll('.profile-menu-item');
    const profileSections = document.querySelectorAll('.profile-section');
    profileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            profileMenuItems.forEach(i => i.classList.remove('active'));
            profileSections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('data-section') + '-section';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Initialize profile menu functionality
    initializeProfileMenu();
    setupProfileInteractions();
    loadProfileData();
    initializePageHandlers();
});

// Kullanıcının gönderilerini arama sayfasındaki gibi göster
function renderUserPosts(posts) {
    const container = document.getElementById('userPostsContainer');
    if (!container) return;
    if (!posts.length) {
        container.innerHTML = '<p>Henüz gönderi yok.</p>';
        return;
    }
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-card-title">${post.title}</div>
            <div class="post-card-content">${stripTags(post.content).substring(0, 120)}${post.content.length > 120 ? '...' : ''}</div>
            <a href="detailed-post.html?id=${post.id}" class="post-card-link">
                <i class="fas fa-arrow-right"></i> Detay
            </a>
        </div>
    `).join('');
}

// Kullanıcının yorumlarını search-comments.html'deki gibi göster
function renderUserComments(comments) {
    const container = document.getElementById('userCommentsContainer');
    if (!container) return;
    if (!comments.length) {
        container.innerHTML = '<p>Henüz yorum yok.</p>';
        return;
    }
    container.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <div class="comment-card-content">${stripTags(comment.content).substring(0, 120)}${comment.content.length > 120 ? '...' : ''}</div>
            <a href="detailed-post.html?id=${comment.post_id}&comment=${comment.id}" class="post-card-link">
                <i class="fas fa-arrow-right"></i> Gönderiye Git
            </a>
        </div>
    `).join('');
}

// HTML etiketlerini kaldırmak için yardımcı fonksiyon
function stripTags(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function loadProfile(userId) {
    // Eğer userId varsa başka kullanıcının profilini, yoksa kendi profilimizi yükle
    const endpoint = userId ? `../../get_profile.php?id=${userId}` : '../../get_profile.php';
    
    fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateProfileUI(data.user);
                renderUserPosts(data.posts);
                renderUserComments(data.comments);
                
                // Takip butonunu sadece başka kullanıcının profilinde göster
                const followButton = document.getElementById('follow-button');
                if (followButton) {
                    if (userId) {
                        followButton.style.display = 'block';
                        followButton.textContent = data.is_following ? 'Takipten Çık' : 'Takip Et';
                        followButton.classList.toggle('following', data.is_following);
                    } else {
                        followButton.style.display = 'none';
                    }
                }
            } else {
                showError(data.message || 'Profil yüklenirken bir hata oluştu');
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            showError('Profil yüklenirken bir hata oluştu');
        });
}

function updateProfileUI(data) {
    document.getElementById('profileName').textContent = data.name + ' ' + data.surname;
    document.getElementById('profileUsername').textContent = '@' + data.username;
    document.getElementById('profileBio').textContent = data.bio || 'Henüz bir biyografi eklenmemiş.';
    document.getElementById('aboutBio').textContent = data.bio || 'Henüz bir biyografi eklenmemiş.';
    document.getElementById('avatarImage').src = data.avatar ? data.avatar : 'images/default-avatar.png';
    document.getElementById('postCount').textContent = data.post_count || 0;
    document.getElementById('commentCount').textContent = data.comment_count || 0;
    document.getElementById('followersCount').textContent = data.followers_count || 0;
    document.getElementById('joinDate').textContent = 'Katılım: ' + formatDate(data.created_at);
}

function toggleFollow(userId) {
    if (!userId) return;

    const formData = new FormData();
    formData.append('userId', userId);

    fetch('../../api/user/toggle-follow.php', {
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

