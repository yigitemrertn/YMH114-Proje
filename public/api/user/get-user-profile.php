<?php
session_start();
require_once '../../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor.'
    ]);
    exit;
}

if (!isset($_GET['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Kullanıcı ID\'si gerekli.'
    ]);
    exit;
}

try {
    $userId = $_GET['id'];
    $currentUserId = $_SESSION['user_id'];
    
    // Kullanıcı bilgilerini al
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.username,
            u.full_name,
            u.bio,
            u.avatar,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
            (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
        FROM users u
        WHERE u.id = ?
    ");
    $stmt->execute([$currentUserId, $userId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        echo json_encode([
            'success' => false,
            'message' => 'Kullanıcı bulunamadı.'
        ]);
        exit;
    }

    // Son gönderileri al
    $stmt = $pdo->prepare("
        SELECT id, title, content, created_at,
            (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comment_count
        FROM posts
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $recentPosts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Son yorumları al
    $stmt = $pdo->prepare("
        SELECT c.id, c.content, c.created_at, p.id as post_id, p.title as post_title
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $recentComments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'profile' => $profile,
        'recentPosts' => $recentPosts,
        'recentComments' => $recentComments
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
} 