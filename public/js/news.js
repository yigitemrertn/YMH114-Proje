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

// Function to get appropriate icon based on title
function getNewsIcon(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('yapay zeka') || lowerTitle.includes('ai') || lowerTitle.includes('chatgpt')) {
        return 'fa-robot';
    } else if (lowerTitle.includes('telefon') || lowerTitle.includes('samsung') || lowerTitle.includes('iphone')) {
        return 'fa-mobile-alt';
    } else if (lowerTitle.includes('güvenlik') || lowerTitle.includes('hack')) {
        return 'fa-shield-alt';
    } else if (lowerTitle.includes('oyun') || lowerTitle.includes('nvidia') || lowerTitle.includes('amd')) {
        return 'fa-gamepad';
    } else {
        return 'fa-newspaper';
    }
}

// Function to show error message
function showErrorMessage(error, debug = null) {
    const featuredList = document.querySelector('.featured-list');
    if (!featuredList) return;
    featuredList.innerHTML = `
        <div class="featured-item">
            <div class="featured-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="featured-content">
                <h3>Haberler yüklenemedi</h3>
                <p>${error}</p>
                ${debug ? `<p class="error-details">${JSON.stringify(debug, null, 2)}</p>` : ''}
            </div>
        </div>
    `;
}

// Function to update featured news
async function updateFeaturedNews() {
    try {
        // fetch yolunu kontrol et: /news.php kökten doğru
        const response = await fetch('/news.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            const featuredList = document.querySelector('.featured-list');
            if (!featuredList) return;
            featuredList.innerHTML = '';
            if (data.news && data.news.length > 0) {
                data.news.forEach(article => {
                    const newsItem = document.createElement('a');
                    newsItem.href = article.url;
                    newsItem.target = '_blank';
                    newsItem.className = 'featured-item';
                    
                    newsItem.innerHTML = `
                        <div class="featured-icon">
                            <i class="fas ${getNewsIcon(article.title)}"></i>
                        </div>
                        <div class="featured-content">
                            <h3>${article.title}</h3>
                            <p>${article.source ? article.source : ''} • ${formatDate(article.publishedAt)}</p>
                        </div>
                    `;
                    
                    featuredList.appendChild(newsItem);
                });
            } else {
                showErrorMessage('Haber bulunamadı');
            }
        } else {
            showErrorMessage(data.error, data.debug);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showErrorMessage(error.message);
    }
}

// Update news when page loads
document.addEventListener('DOMContentLoaded', updateFeaturedNews);

// Update news every 30 minutes
setInterval(updateFeaturedNews, 30 * 60 * 1000);