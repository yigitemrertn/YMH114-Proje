document.addEventListener('DOMContentLoaded', function() {
    // Get user ID from URL if viewing another user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        // ID yoksa ana sayfaya yönlendir
        window.location.href = '../index.html';
        return;
    }

    // Load profile data
    loadProfile(userId);

    // Follow button click handler
    const followButton = document.getElementById('follow-button');
    if (followButton) {
        followButton.addEventListener('click', function() {
            toggleFollow(userId);
        });
    }

    // Menü tab switching
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
});

// Kullanıcının gönderilerini göster
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

// Kullanıcının yorumlarını göster
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
            <a href="detailed-post.html?id=${comment.post_id}&comment=${comment.id}" class="comment-card-link">
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
    fetch(`../get_profile.php?id=${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateProfileUI(data.user, data.posts, data.comments);
                renderUserPosts(data.posts);
                renderUserComments(data.comments);

                // Takip butonunu sadece başka kullanıcının profilinde göster
                const followButton = document.getElementById('follow-button');
                if (followButton) {
                    fetch('../status.php')
                        .then(res => res.json())
                        .then(status => {
                            if (status.loggedIn && String(status.userId) === String(userId)) {
                                followButton.style.display = 'none';
                            } else if (status.loggedIn) {
                                followButton.style.display = 'block';
                                // Takip durumu kontrolü
                                fetch(`api/user/check-follow-status.php?user_id=${userId}`)
                                    .then(res => res.json())
                                    .then(followData => {
                                        followButton.textContent = followData.is_following ? 'Takipten Çık' : 'Takip Et';
                                        followButton.classList.toggle('following', followData.is_following);
                                    });
                            } else {
                                followButton.style.display = 'none';
                            }
                        });
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

function updateProfileUI(data, posts = [], comments = []) {
    document.getElementById('profileName').textContent = data.name + ' ' + data.surname;
    document.getElementById('profileUsername').textContent = '@' + data.username;
    document.getElementById('profileBio').textContent = data.bio || 'Henüz bir biyografi eklenmemiş.';
    document.getElementById('aboutBio').textContent = data.bio || 'Henüz bir biyografi eklenmemiş.';
    // Avatar çerçeveye tam oturacak şekilde göster
    const avatarImg = document.getElementById('avatarImage');
    avatarImg.src = data.avatar ? data.avatar : 'images/default-avatar.png';
    avatarImg.style.width = '100%';
    avatarImg.style.height = '100%';
    avatarImg.style.objectFit = 'cover';
    avatarImg.style.borderRadius = '50%';
    avatarImg.style.border = 'none';
    avatarImg.style.background = '#f5f5f5';
    avatarImg.style.display = 'block';
    // Sayıları güncel tut
    document.getElementById('postCount').textContent = posts.length || 0;
    document.getElementById('commentCount').textContent = comments.length || 0;
    document.getElementById('followersCount').textContent = data.followers_count || 0;
    document.getElementById('joinDate').textContent = 'Katılım: ' + formatDate(data.created_at);
}

function toggleFollow(userId) {
    if (!userId) return;

    fetch('../toggle_follow.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Takip/çık sonrası tekrar takip durumu kontrolü ve UI güncellemesi
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

