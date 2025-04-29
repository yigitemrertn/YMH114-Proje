// Renk paleti - her harf için farklı bir renk
const colorPalette = {
    'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1', 'D': '#96CEB4', 'E': '#FFEEAD',
    'F': '#D4A5A5', 'G': '#9B59B6', 'H': '#3498DB', 'I': '#1ABC9C', 'J': '#F1C40F',
    'K': '#E67E22', 'L': '#E74C3C', 'M': '#34495E', 'N': '#16A085', 'O': '#F39C12',
    'P': '#D35400', 'Q': '#C0392B', 'R': '#8E44AD', 'S': '#2C3E50', 'T': '#27AE60',
    'U': '#2980B9', 'V': '#D35400', 'W': '#7F8C8D', 'X': '#2C3E50', 'Y': '#F1C40F',
    'Z': '#E74C3C'
};

// Varsayılan renk (eğer harf bulunamazsa)
const defaultColor = '#95A5A6';

function generateAvatar(initials, size = 150) {
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Yuvarlak arka plan çiz
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fillStyle = initials === '?' ? '#2C3E50' : (colorPalette[initials] || defaultColor);
    ctx.fill();

    // Metin stilini ayarla
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Metni çiz
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toDataURL();
}

// Profil resmi için avatar oluşturma fonksiyonu
function setDefaultAvatar(username) {
    const avatarElements = document.querySelectorAll('.profile-avatar img, .post-avatar img, .suggestion-avatar img');
    
    avatarElements.forEach(img => {
        if (!img.src || img.src.includes('placeholder.com')) {
            // Kullanıcı adı yoksa veya geçersizse soru işareti kullan
            const displayInitial = username && username.length > 0 ? username.charAt(0).toUpperCase() : '?';
            img.src = generateAvatar(displayInitial);
        }
    });
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı adını localStorage'dan al
    const username = localStorage.getItem('username');
    setDefaultAvatar(username);
}); 