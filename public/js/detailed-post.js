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
    document.getElementById('authorAvatar').src = post.avatar || 'images/default-avatar.png';
    
    // Post içeriği
    document.querySelector('.post-title').textContent = post.title;
    document.querySelector('.post-text').textContent = post.content;
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
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <div class="comment-user-info">
                    <img src="${comment.avatar || 'images/default-avatar.png'}" alt="Profil Fotoğrafı" class="author-avatar">
                    <div class="user-details">
                        <span class="username">${comment.name} ${comment.surname}</span>
                        <span class="comment-time">${formatDate(comment.created_at)}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
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

// Sayfa yüklendiğinde post detaylarını çek
document.addEventListener('DOMContentLoaded', () => {
    if (postId) {
        fetchPostDetails();
    } else {
        showError('Post ID bulunamadı');
    }

    // Yorum gönderme butonunu doğru şekilde bağla
    const submitBtn = document.getElementById('submitCommentBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitComment();
        });
    }
});