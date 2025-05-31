<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$query = trim($data['query'] ?? '');
$type = $data['type'] ?? 'users';

if (empty($query) || !in_array($type, ['users', 'posts', 'comments'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz arama']);
    exit;
}

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Oturum bulunamadı']);
    exit;
}

// Geçmiş aramaları session'da tut
$searchKey = "search_history_{$userId}_{$type}";
if (!isset($_SESSION[$searchKey])) {
    $_SESSION[$searchKey] = [];
}
if ($query && !in_array($query, $_SESSION[$searchKey])) {
    array_unshift($_SESSION[$searchKey], $query);
    $_SESSION[$searchKey] = array_slice($_SESSION[$searchKey], 0, 5);
}
$filteredHistory = array_values(array_filter($_SESSION[$searchKey], function($item) use ($query) {
    return stripos($item, $query) !== false;
}));

try {
    if ($type === 'users') {
        $stmt = $pdo->prepare("SELECT id, username, name, surname FROM users WHERE (username LIKE ? OR name LIKE ? OR surname LIKE ?) LIMIT 20");
        $stmt->execute(["%$query%", "%$query%", "%$query%"]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif ($type === 'posts') {
        $stmt = $pdo->prepare("SELECT id, title, content FROM posts WHERE (title LIKE ? OR content LIKE ?) LIMIT 20");
        $stmt->execute(["%$query%", "%$query%"]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else { // comments => ilgili postu getir
        // Yorumlarda arama yap, eşleşen yorumların post_id'lerini ve ilk eşleşen yorumu bul
        $stmt = $pdo->prepare("SELECT post_id, content, id FROM comments WHERE content LIKE ? ORDER BY post_id, id");
        $stmt->execute(["%$query%"]);
        $allMatches = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // post_id => ilk eşleşen yorum
        $firstComments = [];
        foreach ($allMatches as $row) {
            $pid = $row['post_id'];
            if (!isset($firstComments[$pid])) {
                $firstComments[$pid] = [
                    'comment_id' => $row['id'],
                    'content' => $row['content']
                ];
            }
        }
        $postIds = array_keys($firstComments);

        $results = [];
        if (!empty($postIds)) {
            $inQuery = implode(',', array_fill(0, count($postIds), '?'));
            $stmt = $pdo->prepare("SELECT id, title, content FROM posts WHERE id IN ($inQuery)");
            $stmt->execute($postIds);
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Her postun altına ilk eşleşen yorumu ekle
            foreach ($posts as $post) {
                $pid = $post['id'];
                $results[] = [
                    'id' => $post['id'],
                    'title' => $post['title'],
                    'content' => $post['content'],
                    'matched_comment' => isset($firstComments[$pid]) ? $firstComments[$pid] : null
                ];
            }
        }
    }

    echo json_encode([
        'results' => $results,
        'previous' => $filteredHistory
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Arama sırasında hata oluştu']);
}
?>
