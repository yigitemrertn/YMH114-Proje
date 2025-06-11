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

    // Takip butonu click handler (sadece burada olmalı)
    const followButton = document.getElementById('follow-button');
    if (followButton) {
        followButton.onclick = function(e) {
            e.preventDefault();
            toggleFollow(userId);
        };
    }

    // Profil fotoğrafı büyütme (modal) - kare ve sabit boyut
    const avatarImg = document.getElementById('avatarImage');
    const avatarModal = document.getElementById('avatarModal');
    const avatarModalImg = document.getElementById('avatarModalImg');
    if (avatarImg && avatarModal && avatarModalImg) {
        // Modal stilini ayarla (her zaman aynı boyut)
        avatarModal.style.position = 'fixed';
        avatarModal.style.top = '0';
        avatarModal.style.left = '0';
        avatarModal.style.width = '100vw';
        avatarModal.style.height = '100vh';
        avatarModal.style.background = 'rgba(0,0,0,0.65)';
        avatarModal.style.display = 'none';
        avatarModal.style.justifyContent = 'center';
        avatarModal.style.alignItems = 'center';
        avatarModal.style.zIndex = '9999';

        avatarModalImg.style.width = '400px';
        avatarModalImg.style.height = '400px';
        avatarModalImg.style.objectFit = 'cover';
        avatarModalImg.style.borderRadius = '0'; // Kare
        avatarModalImg.style.background = '#fff';
        avatarModalImg.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
        avatarModalImg.style.display = 'block';

        avatarImg.addEventListener('click', function(e) {
            e.stopPropagation();
            avatarModalImg.src = avatarImg.src;
            avatarModal.style.display = 'flex';
        });

        // Modal dışında bir yere tıklanınca kapat
        avatarModal.addEventListener('click', function(e) {
            if (e.target === avatarModal) {
                avatarModal.style.display = 'none';
                avatarModalImg.src = '';
            }
        });

        // ESC ile de kapat
        document.addEventListener('keydown', function(e) {
            if (avatarModal.style.display === 'flex' && e.key === 'Escape') {
                avatarModal.style.display = 'none';
                avatarModalImg.src = '';
            }
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
        <div class="user-post-card">
            <div class="user-post-card-title">${post.title}</div>
            <div class="user-post-card-content">${stripTags(post.content).substring(0, 120)}${post.content.length > 120 ? '...' : ''}</div>
            <a href="detailed-post.html?id=${post.id}" class="user-post-card-link">
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
        <div class="user-comment-card">
            <div class="user-comment-card-content">${stripTags(comment.content).substring(0, 120)}${comment.content.length > 120 ? '...' : ''}</div>
            <a href="detailed-post.html?id=${comment.post_id}&comment=${comment.id}" class="user-comment-card-link">
                <i class="fas fa-arrow-right"></i> Gönderiye Git
            </a>
        </div>
    `).join('');
}

// HTML etiketlerini kaldırmak için yardımcı fonksiyon
function stripTags(html) {
    let div = document.createElement('div');
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

// Takip etme fonksiyonelliğini baştan yaz
function toggleFollow(userId) {
    if (!userId) return;

    const followButton = document.getElementById('follow-button');
    if (followButton) {
        followButton.disabled = true;
        followButton.textContent = 'İşleniyor...';
    }

    const formData = new FormData();
    formData.append('userId', userId);

    fetch('api/user/toggle-follow.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (followButton) {
            followButton.disabled = false;
        }
        // Takip işlemi başarılıysa buton ve takipçi sayısı anında güncellenir
        if (data && typeof data === 'object') {
            if (data.success) {
                // Takip durumu kontrolü ve güncelle
                fetch(`api/user/check-follow-status.php?user_id=${userId}`, { credentials: 'same-origin' })
                    .then(res => res.json())
                    .then(followData => {
                        if (followButton) {
                            if (followData.is_following) {
                                followButton.textContent = 'Takipten Çık';
                                followButton.classList.add('following');
                            } else {
                                followButton.textContent = 'Takip Et';
                                followButton.classList.remove('following');
                            }
                        }
                        // Takipçi sayısını güncelle
                        updateFollowersCount(userId);
                        showSuccess(data.message || 'Takip işlemi başarılı');
                    });
            } else {
                showError(data.message || 'Takip işlemi başarısız');
                // Takip başarısızsa butonun metnini tekrar kontrol et
                fetch(`api/user/check-follow-status.php?user_id=${userId}`, { credentials: 'same-origin' })
                    .then(res => res.json())
                    .then(followData => {
                        if (followButton) {
                            if (followData.is_following) {
                                followButton.textContent = 'Takipten Çık';
                                followButton.classList.add('following');
                            } else {
                                followButton.textContent = 'Takip Et';
                                followButton.classList.remove('following');
                            }
                        }
                        updateFollowersCount(userId);
                    });
            }
        } else {
            showError('Sunucudan beklenmeyen bir cevap alındı.');
            if (followButton) {
                followButton.textContent = 'Takip Et';
            }
        }
    })
    .catch(error => {
        if (followButton) {
            followButton.disabled = false;
            followButton.textContent = 'Takip Et';
        }
        showError('Takip işlemi sırasında bir hata oluştu: ' + (error.message || error));
        console.error('Takip işlemi hatası:', error);
    });
}

// Takipçi sayısını güncellemek için yardımcı fonksiyon
function updateFollowersCount(userId) {
    fetch('api/user/get-user-profile.php?id=' + encodeURIComponent(userId))
        .then(res => res.json())
        .then(data => {
            if (data.success && data.profile) {
                const followersCount = document.getElementById('followersCount');
                if (followersCount) {
                    followersCount.textContent = data.profile.followers_count || 0;
                }
            }
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

