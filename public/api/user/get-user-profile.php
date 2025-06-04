<?php
session_start();
use '../../../config.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID\'si gerekli']);
    exit;
}

$userId = $_GET['id'];

try {
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.name, u.surname, u.email, u.created_at,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
            (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count
        FROM users u
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
        exit;
    }

    echo json_encode(['success' => true, 'profile' => $user]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Profil bilgileri alınırken bir hata oluştu']);
}
