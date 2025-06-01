// Function to format the date
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
    // loadNews(); // Haberler artık dinamik yüklenmeyecek, statik HTML kullanılacak
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

// function loadNews() {
//     fetch('/news.php')
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 const featuredList = document.querySelector('.featured-list');
//                 featuredList.innerHTML = ''; // Clear existing content
//
//                 data.news.forEach(news => {
//                     const newsElement = createNewsElement(news);
//                     featuredList.appendChild(newsElement);
//                 });
//             } else {
//                 console.error('Error loading news:', data.error);
//                 showNewsError('Haberler yüklenirken bir hata oluştu.');
//             }
//         })
//         .catch(error => {
//             console.error('Error loading news:', error);
//             showNewsError('Haberler yüklenirken bir hata oluştu.');
//         });
// }

function createPostElement(post) {
    const postCard = document.createElement('article');
    postCard.className = 'post-card';
    postCard.style.cursor = 'pointer';
    postCard.addEventListener('click', function() {
        window.location.href = `/public/detailed-post.html?id=${post.id}`;
    });

    // Avatar yolu düzeltildi
    let avatarSrc = post.avatar || post.author?.avatar || 'images/default-avatar.png';
    if (avatarSrc && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('/')) {
        avatarSrc = '/public/' + avatarSrc;
    }

    postCard.innerHTML = `
        <div class="post-header">
            <div class="profile-picture">

                <img src="${avatarSrc}" alt="${post.username || post.author?.username}'s avatar" style="width:50px;height:50px;object-fit:cover;border-radius:50%;border:2px solid #e0e0e0;">

            </div>
            <div class="user-details">
                <span class="username">@${post.username || post.author?.username}</span>
                <span class="post-date" style="font-size:0.97em;color:#888;margin-top:2px;">${formatDate(post.created_at)}</span>
            </div>
        </div>

        <h2 class="post-title" style="margin:0.7em 0 0.3em 0;">
            <a href="/public/detailed-post.html?id=${post.id}" class="post-title-link" style="color:var(--text-primary);text-decoration:none;">${post.title}</a>

        </h2>
        <div class="post-content" style="margin-bottom:0.7em;color:var(--text-secondary);font-size:1.05em;line-height:1.6;">
            ${formatPostContent(post.content)}
        </div>

        <div class="post-actions" style="display:flex;align-items:center;gap:1em;">
            <span style="color:#888;font-size:0.97em;"><i class="fas fa-comment"></i> ${post.comment_count || post.stats?.comments || 0}</span>
            <a href="/public/detailed-post.html?id=${post.id}" class="post-title-link" style="margin-left:auto;color:#3498db;font-weight:500;text-decoration:none;">
                <i class="fas fa-arrow-right"></i> Detay
            </a>

        </div>
    `;
    return postCard;
}

function createNewsElement(news) {
    const newsElement = document.createElement('div');
    newsElement.className = 'featured-topic';
    
    newsElement.innerHTML = `
        <div class="topic-content">
            <div class="topic-header">
                <span class="topic-source">${news.source}</span>
                <span class="topic-date">${formatDate(news.publishedAt)}</span>
            </div>
            <h3 class="topic-title">
                <a href="${news.url}" target="_blank" rel="noopener noreferrer">${news.title}</a>
            </h3>
            <p class="topic-description">${truncateText(news.description, 100)}</p>
        </div>
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
    const postUrl = `${window.location.origin}/detailed-post.html?id=${postId}`;
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
    window.location.href = `/public/detailed-post.html?id=${postId}#comment-input`;
}

function showSuccessMessage(message) {
    // Implement success message display
    console.log(message);
}