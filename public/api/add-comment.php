<?php
session_start();

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Oturum açmanız gerekiyor']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Geçersiz istek metodu']);
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
$postId = (int)($data['post_id'] ?? 0);
$content = isset($data['content']) ? trim($data['content']) : '';
$parentCommentId = isset($data['parent_comment_id']) ? (int)$data['parent_comment_id'] : null; // yeni satır

if ($postId <= 0 || $content === '') {
    echo json_encode(['success' => false, 'message' => 'Eksik veri']);
    exit;
}
try {
    // parent_comment_id desteği
    if ($parentCommentId) {
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content, created_at, updated_at, parent_comment_id) VALUES (?, ?, ?, NOW(), NOW(), ?)");
        $stmt->execute([$postId, $_SESSION['user_id'], $content, $parentCommentId]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $stmt->execute([$postId, $_SESSION['user_id'], $content]);
    }
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Yorum eklenemedi: ' . $e->getMessage()]);
}
?>
