// Function to format the date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    } else {
        return `${Math.floor(diffInHours / 24)} gün önce`;
    }
}

// Function to truncate text
function truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Function to format content with line breaks
function formatContent(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// Function to update posts
async function updatePosts() {
    try {
        const response = await fetch('/public/api/posts.php');
        
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
                    const formattedContent = formatContent(post.content);
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
                            <a href="/public/detailed-post.html?id=${post.id}" class="post-card-readmore">
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
document.addEventListener('DOMContentLoaded', updatePosts);

// Update posts every 5 minutes
setInterval(updatePosts, 5 * 60 * 1000); 