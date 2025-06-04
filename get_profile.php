<?php
session_start();
use 'config.php';

header('Content-Type: application/json');

if (isset($_GET['random']) && $_GET['random'] == 1) {
    $excludeId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;
    $stmt = $pdo->prepare("
        SELECT id, username, name, surname, avatar,
        (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers_count
        FROM users
        WHERE id != ?
        ORDER BY RAND()
        LIMIT 4
    ");
    $stmt->execute([$excludeId]);
    $similar = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'similar' => $similar]);
    exit;
}

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
    exit;
}

$userId = $_GET['id'];

try {
    // Kullanıcı bilgilerini getir
    $stmt = $pdo->prepare("
        SELECT id, username, name, surname, email, bio, avatar, created_at
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
        exit;
    }

    // Kullanıcının gönderilerini getir
    $stmt = $pdo->prepare("
        SELECT p.*,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$userId]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Kullanıcının yorumlarını getir
    $stmt = $pdo->prepare("
        SELECT c.*, p.title as post_title, p.id as post_id
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$userId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Takipçi ve takip edilen sayılarını getir
    $stmt = $pdo->prepare("
        SELECT 
            (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count
    ");
    $stmt->execute([$userId, $userId]);
    $followCounts = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'user' => array_merge($user, [
            'followers_count' => (int)$followCounts['followers_count'],
            'following_count' => (int)$followCounts['following_count']
        ]),
        'posts' => $posts,
        'comments' => $comments
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı hatası']);
}
