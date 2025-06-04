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
    // Kullanıcının gönderilerini al
    $stmt = $pdo->prepare("
        SELECT p.*,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$userId]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Gönderiler alınırken bir hata oluştu'
    ]);
}
