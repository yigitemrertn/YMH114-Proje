// URL'den post ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Post verilerini çek
async function fetchPostDetails() {
    try {
        const response = await fetch(`/public/api/posts.php?id=${postId}`);
        if (!response.ok) {
            throw new Error('Post yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        
        if (data.success) {
            displayPostDetails(data.post);
            loadComments(postId);
        } else {
            showError('Post bulunamadı');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Post detaylarını göster
function displayPostDetails(post) {
    document.title = `${post.title} - ForumFU`;
    
    // Yazar bilgileri
    document.querySelector('.author-name').textContent = `${post.name} ${post.surname}`;
    document.querySelector('.post-date').textContent = formatDate(post.created_at);
    
    // Post içeriği
    document.querySelector('.post-title').textContent = post.title;
    document.querySelector('.post-text').innerHTML = formatPostContent(post.content);
}

// Yorumları yükle
async function loadComments(postId) {
    try {
        const response = await fetch(`/public/api/get_comments.php?post_id=${postId}`);
        if (!response.ok) {
            throw new Error('Yorumlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        
        if (data.success) {
            displayComments(data.comments);
        }
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Yorumları göster
function displayComments(comments) {
    const commentsList = document.querySelector('.comments-list');
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <div class="comment-user-info">
                    <img src="images/default-avatar.png" alt="Profil Fotoğrafı" class="author-avatar">
                    <div class="user-details">
                        <span class="username">${comment.name} ${comment.surname}</span>
                        <span class="comment-time">${formatDate(comment.created_at)}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">${formatPostContent(comment.content)}</div>
        </div>
    `).join('');
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
        const response = await fetch('/public/api/get_comments.php', {
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
        } else {
            showError(data.message || 'Yorum gönderilemedi');
        }
    } catch (error) {
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
            alert('Link kopyalandı!');
        }).catch(console.error);
    }
}

// Post bildir
function reportPost() {
    alert('Bildirim özelliği yakında eklenecek!');
}

// Hata mesajı göster
function showError(message) {
    alert(message);
}

// Sayfa yüklendiğinde post detaylarını çek
document.addEventListener('DOMContentLoaded', () => {
    if (postId) {
        fetchPostDetails();
    } else {
        showError('Post ID bulunamadı');
    }
}); 