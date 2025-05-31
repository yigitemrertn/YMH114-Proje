// Function to format the date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} dakika önce`;
        }
        return `${diffHours} saat önce`;
    } else if (diffDays === 1) {
        return 'Dün';
    } else if (diffDays < 7) {
        return `${diffDays} gün önce`;
    } else {
        return date.toLocaleDateString('tr-TR');
    }
}

// Function to truncate text
function truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Function to format content with line breaks
function formatContent(content) {
    // Tüm HTML etiketlerini kaldır, sadece düz metin kalsın
    return content
        .replace(/<[^>]*>/g, '') // HTML etiketlerini sil
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// Function to format post content
function formatPostContent(content) {
    // HTML etiketlerini temizle
    content = content.replace(/<[^>]*>/g, '');
    
    // URL'leri tespit et ve link haline getir
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    
    // Satır sonlarını <br> ile değiştir
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

// Function to update posts
async function updatePosts() {
    try {
        const response = await fetch('/posts.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const postsContainer = document.querySelector('.posts-container');
            postsContainer.innerHTML = ''; // Clear existing content
            
            if (data.posts && data.posts.length > 0) {
                data.posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'post-card';
                    
                    // Format the content
                    const formattedContent = formatPostContent(post.content);
                    const truncatedContent = truncateText(formattedContent);
                    
                    postElement.innerHTML = `
                        <div class="post-card-header">
                            <img src="${post.author.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}" class="post-card-avatar" alt="Profil Fotoğrafı">
                            <span class="post-card-username">@${post.author.username}</span>
                        </div>
                        <div class="post-card-title">${post.title}</div>
                        <div class="post-card-desc">${truncatedContent}</div>
                        <div class="post-card-footer">
                            <div class="post-card-stats">
                                <span class="post-card-stat"><i class="fas fa-heart"></i> ${post.stats.likes}</span>
                                <span class="post-card-stat"><i class="fas fa-comment"></i> ${post.stats.comments}</span>
                            </div>
                            <a href="../detailed-post.html?id=${post.id}" class="post-card-readmore">
                                <i class="fas fa-arrow-right"></i> Devamını gör
                            </a>
                        </div>
                    `;
                    
                    postsContainer.appendChild(postElement);
                });
            } else {
                postsContainer.innerHTML = `
                    <div class="no-posts">
                        <i class="fas fa-newspaper"></i>
                        <p>Henüz hiç gönderi yok.</p>
                        <p class="sub-text">İlk gönderiyi sen paylaş!</p>
                    </div>
                `;
            }
        } else {
            throw new Error(data.error || 'Failed to fetch posts');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        const postsContainer = document.querySelector('.posts-container');
        postsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gönderiler yüklenirken bir hata oluştu.</p>
                <p class="sub-text">Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
    }
}

// Update posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    loadNews();
});

// Update posts every 5 minutes
setInterval(updatePosts, 5 * 60 * 1000);

function loadPosts() {
    fetch('/posts.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const postsContainer = document.querySelector('.posts-container');
                postsContainer.innerHTML = ''; // Clear existing posts

                data.posts.forEach(post => {
                    const postElement = createPostElement(post);
                    postsContainer.appendChild(postElement);
                });
            } else {
                console.error('Error loading posts:', data.error);
                showErrorMessage('Gönderiler yüklenirken bir hata oluştu.');
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            showErrorMessage('Gönderiler yüklenirken bir hata oluştu.');
        });
}

function loadNews() {
    fetch('/news.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const featuredList = document.querySelector('.featured-list');
                featuredList.innerHTML = ''; // Clear existing content

                data.news.forEach(news => {
                    const newsElement = createNewsElement(news);
                    featuredList.appendChild(newsElement);
                });
            } else {
                console.error('Error loading news:', data.error);
                showNewsError('Haberler yüklenirken bir hata oluştu.');
            }
        })
        .catch(error => {
            console.error('Error loading news:', error);
            showNewsError('Haberler yüklenirken bir hata oluştu.');
        });
}

function createPostElement(post) {
    const postCard = document.createElement('article');
    postCard.className = 'post-card';

    postCard.innerHTML = `
        <div class="post-header">
            <div class="profile-picture">
                <img src="images/${post.author.avatar || 'default-avatar.png'}" alt="${post.author.username}'s avatar">
            </div>
            <div class="user-details">
                <span class="username">@${post.author.username}</span>
            </div>
            <div class="post-date" style="margin-left:auto;font-size:0.97em;color:#888;">
                ${formatDate(post.created_at)}
            </div>
        </div>
        
        <h2 class="post-title">
            <a href="../detailed-post.html?id=${post.id}" class="post-title-link">${post.title}</a>
        </h2>
        
        <div class="post-content">
            ${formatPostContent(post.content)}
        </div>
        <div class="post-actions" style="margin-top:0.7em;display:flex;align-items:center;gap:1em;">
            <!-- Like butonu ve like-count kaldırıldı -->
        </div>
    `;
    // Like butonuna event ekleme kaldırıldı
    return postCard;
}

function createNewsElement(news) {
    const newsElement = document.createElement('div');
    newsElement.className = 'featured-topic';
    
    newsElement.innerHTML = `
        <a href="${news.url}" target="_blank" class="topic-link">
            <h3 class="topic-title">${news.title}</h3>
            <div class="topic-meta">
                <span class="topic-source">${news.source}</span>
                <span class="topic-date">${formatDate(news.publishedAt)}</span>
            </div>
            <p class="topic-description">${news.description}</p>
        </a>
    `;
    
    return newsElement;
}

function showErrorMessage(message) {
    const postsContainer = document.querySelector('.posts-container');
    postsContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function showNewsError(message) {
    const featuredList = document.querySelector('.featured-list');
    featuredList.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function sharePost(postId) {
    const postUrl = `${window.location.origin}/../detailed-post.html?id=${postId}`;
    navigator.clipboard.writeText(postUrl)
        .then(() => {
            showSuccessMessage('Gönderi bağlantısı kopyalandı!');
        })
        .catch(() => {
            showErrorMessage('Bağlantı kopyalanırken bir hata oluştu.');
        });
}

function reportPost(postId) {
    // Implement report functionality
    console.log('Report post:', postId);
}

function focusCommentInput(postId) {
    window.location.href = `../detailed-post.html?id=${postId}#comment-input`;
}

function showSuccessMessage(message) {
    // Implement success message display
    console.log(message);
}