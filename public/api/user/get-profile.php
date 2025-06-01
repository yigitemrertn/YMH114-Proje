<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor.'
    ]);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    
    // Kullanıcı bilgilerini al
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.username,
            u.name,
            u.surname,
            u.bio,
            u.avatar,
            u.email,
            u.created_at,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
            (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
        FROM users u
        WHERE u.id = ?
    ");
    $stmt->execute([$userId, $userId]);
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

    // Profilde isim göstermek için
    $profile['full_name'] = $profile['name'] . ' ' . $profile['surname'];

    echo json_encode([
        'success' => true,
        'profile' => [
            'id' => $profile['id'],
            'username' => $profile['username'],
            'name' => $profile['name'],
            'surname' => $profile['surname'],
            'bio' => $profile['bio'],
            'avatar' => $profile['avatar'],
            'email' => $profile['email'],
            'created_at' => $profile['created_at'],
            'post_count' => $profile['post_count'],
            'comment_count' => $profile['comment_count'],
            'following_count' => $profile['following_count'],
            'followers_count' => $profile['followers_count'],
            'is_following' => $profile['is_following']
        ],
        'recentPosts' => $recentPosts,
        'recentComments' => $recentComments
    ]);

    // DEBUG: Eğer buraya kadar gelirse
    file_put_contents(__DIR__.'/debug.txt', 'Çalıştı: '.date('Y-m-d H:i:s').PHP_EOL, FILE_APPEND);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
}