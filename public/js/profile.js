document.addEventListener('DOMContentLoaded', function() {
    // Get user ID from URL if viewing another user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    // Load profile data based on whether we're viewing our own profile or another user's
    const endpoint = userId ? `../api/user/get-user-profile.php?id=${userId}` : '../api/user/get-profile.php';
    
    fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateProfileUI(data.profile);
                loadUserPosts(userId);
                loadUserComments(userId);
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });

    // Setup profile menu switching
    const menuItems = document.querySelectorAll('.profile-menu-item');
    const sections = document.querySelectorAll('.profile-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active states
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(`${section}-section`).classList.add('active');
        });
    });

    // Setup follow button
    const followButton = document.getElementById('follow-button');
    if (followButton) {
        followButton.addEventListener('click', () => {
            if (!userId) return;
            
            const isFollowing = followButton.classList.contains('following');
            const action = isFollowing ? 'unfollow' : 'follow';
            
            fetch(`../api/user/${action}.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    followButton.classList.toggle('following');
                    followButton.textContent = isFollowing ? 'Takip Et' : 'Takipten Çık';
                    // Update followers count
                    const followersCount = document.getElementById('followersCount');
                    const currentCount = parseInt(followersCount.textContent);
                    followersCount.textContent = isFollowing ? currentCount - 1 : currentCount + 1;
                }
            });
        });
    }
});

function updateProfileUI(profile) {
    document.getElementById('profileName').textContent = `${profile.name} ${profile.surname}`;
    document.getElementById('profileUsername').textContent = `@${profile.username}`;
    document.getElementById('profileBio').textContent = profile.bio || 'Henüz bir biyografi eklenmemiş.';
    document.getElementById('aboutBio').textContent = profile.bio || 'Henüz bir biyografi eklenmemiş.';
    document.getElementById('joinDate').textContent = 'Katılım: ' + (profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : '-');
    document.getElementById('avatarImage').src = profile.avatar || 'images/default-avatar.png';
    document.getElementById('postCount').textContent = profile.post_count || 0;
    document.getElementById('commentCount').textContent = profile.comment_count || 0;
    document.getElementById('followersCount').textContent = profile.followers_count || 0;
    
    // Update follow button
    const followBtn = document.getElementById('follow-button');
    if (followBtn && profile.is_following !== undefined) {
        followBtn.style.display = 'block';
        if (profile.is_following) {
            followBtn.textContent = 'Takipten Çık';
            followBtn.classList.add('following');
        } else {
            followBtn.textContent = 'Takip Et';
            followBtn.classList.remove('following');
        }
    } else if (followBtn) {
        followBtn.style.display = 'none';
    }
}

function loadUserPosts(userId) {
    const container = document.getElementById('userPostsContainer');
    if (!container) return;

    fetch(`../api/user/get-user-posts.php?id=${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                container.innerHTML = data.posts.map(post => `
                    <div class="post-item">
                        <div class="post-content">
                            <h3><a href="detailed-topic.html?id=${post.id}">${post.title}</a></h3>
                            <p>${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                            <div class="post-meta">
                                <span class="post-date">${new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                <span class="comment-count">${post.comment_count} yorum</span>
                            </div>
                        </div>
                    </div>
                `).join('') || '<p class="no-content">Henüz gönderi yok.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            container.innerHTML = '<p class="error">Gönderiler yüklenirken bir hata oluştu.</p>';
        });
}

function loadUserComments(userId) {
    const container = document.getElementById('userCommentsContainer');
    if (!container) return;

    fetch(`../api/user/get-user-comments.php?id=${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                container.innerHTML = data.comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-content">
                            <p>${comment.content}</p>
                            <div class="comment-meta">
                                <a href="detailed-topic.html?id=${comment.post_id}">Gönderiye git</a>
                                <span class="comment-date">${new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                `).join('') || '<p class="no-content">Henüz yorum yok.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            container.innerHTML = '<p class="error">Yorumlar yüklenirken bir hata oluştu.</p>';
        });
}

