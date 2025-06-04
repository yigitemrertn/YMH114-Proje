<?php
session_start();
use 'config.php';

header('Content-Type: application/json');

if (!isset($_GET['post_id'])) {
    echo json_encode(['success' => false, 'message' => 'Post ID gerekli']);
    exit;
}

$postId = $_GET['post_id'];

try {
    $stmt = $pdo->prepare("
        SELECT c.*, u.username, u.name, u.surname, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
    
    $stmt->execute([$postId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'comments' => $comments]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı hatası']);
}
