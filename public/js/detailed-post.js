// URL'den post ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Post verilerini çek
async function fetchPostDetails() {
    try {
        console.log('Fetching post details for ID:', postId);
        const response = await fetch(`../get_post.php?id=${postId}`);
        if (!response.ok) {
            throw new Error('Post yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        console.log('Post data:', data);
        
        if (data.success) {
            displayPostDetails(data.post);
            loadComments(postId);
        } else {
            showError('Post bulunamadı');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        showError(error.message);
    }
}

// Post detaylarını göster
function displayPostDetails(post) {
    console.log('Displaying post details:', post);
    document.title = `${post.title} - ForumFU`;

    // Yazar bilgileri
    document.querySelector('.author-name').textContent = `${post.name} ${post.surname}`;
    document.querySelector('.post-date').textContent = formatDate(post.created_at);


    // Post içeriği
    document.querySelector('.post-title').textContent = post.title;
    document.querySelector('.post-text').innerHTML = formatPostContent(post.content);

    // Avatar gösterimi
    let avatarSrc = post.avatar || 'images/default-avatar.png';
    if (avatarSrc && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('/')) {
        avatarSrc = '/public/' + avatarSrc;
    }
    const avatarImg = document.querySelector('.author-avatar');
    if (avatarImg) avatarImg.src = avatarSrc;

}

// Yorumları yükle
async function loadComments(postId) {
    try {
        console.log('Loading comments for post ID:', postId);
        const response = await fetch(`../get_comments.php?post_id=${postId}`);
        if (!response.ok) {
            throw new Error('Yorumlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        console.log('Comments data:', data);
        
        if (data.success) {
            displayComments(data.comments);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Yorumları göster
function displayComments(comments) {
    console.log('Displaying comments:', comments);
    const commentsList = document.querySelector('.comments-list');

    commentsList.innerHTML = comments.map(comment => {
        let avatarSrc = comment.avatar || 'images/default-avatar.png';
        if (avatarSrc && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('/')) {
            avatarSrc = '/public/' + avatarSrc;
        }
        return `
        <div class="comment" style="background:#f8fafd;border-radius:10px;padding:1em 1.2em;margin-bottom:1em;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div class="comment-header" style="display:flex;align-items:center;gap:1em;">
                <div class="comment-user-info" style="display:flex;align-items:center;gap:0.7em;">
                    <img src="${avatarSrc}" alt="Profil Fotoğrafı" class="author-avatar" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #e0e0e0;">
                    <div class="user-details" style="display:flex;flex-direction:column;">
                        <span class="username" style="font-weight:600;color:#3498db;font-size:1em;">${comment.name} ${comment.surname}</span>
                        <span class="comment-time" style="font-size:0.93em;color:#888;">${formatDate(comment.created_at)}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content" style="margin-top:0.5em;font-size:1.04em;line-height:1.6;color:#222;">
                ${formatPostContent(comment.content)}
            </div>

        </div>
        `;
    }).join('');
}

// Yorum gönder
async function submitComment() {
    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();
    
    if (!content) {
        showError('Lütfen bir yorum yazın');
        return;
    }
    
    try {
        const response = await fetch('../create_comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: postId,
                content: content
            })
        });
        
        if (!response.ok) {
            throw new Error('Yorum gönderilirken bir hata oluştu');
        }
        
        const data = await response.json();
        if (data.success) {
            commentInput.value = '';
            loadComments(postId);
            showSuccess('Yorum başarıyla gönderildi');
        } else {
            showError(data.message || 'Yorum gönderilemedi');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        showError(error.message);
    }
}

// Post paylaş
function sharePost() {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showSuccess('Link kopyalandı!');
        }).catch(console.error);
    }
}

// Post bildir
function reportPost() {
    alert('Bildirim özelliği yakında eklenecek!');
}

// Hata mesajı göster
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Başarı mesajı göster
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Tarih formatı fonksiyonu güncellendi
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Şimdi';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} saat önce`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} gün önce`;
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

// Sayfa yüklendiğinde post detaylarını çek
document.addEventListener('DOMContentLoaded', () => {
    if (postId) {
        fetchPostDetails();
    } else {
        showError('Post ID bulunamadı');
    }
});