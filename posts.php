<?php
session_start();
require_once __DIR__ . '/public/config.php';

header('Content-Type: application/json');

try {
    // Eğer ID parametresi varsa, tek bir post getir
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("
            SELECT p.*, u.username, u.name, u.surname, u.avatar,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        ");
        
        $stmt->execute([$_GET['id']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($post) {
            // Avatar kontrolü
            if (empty($post['avatar'])) {
                $post['avatar'] = 'public/images/default-avatar.png'; // Varsayılan avatar yolu
            } else {
                // Avatar varsa tam yolunu ekle
                $post['avatar'] = $post['avatar'];
            }
            echo json_encode(['success' => true, 'post' => $post]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Post bulunamadı']);
        }
    }
    // ID yoksa, tüm postları getir
    else {
        $stmt = $pdo->prepare("
            SELECT p.*, u.username, u.name, u.surname, u.avatar,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 20
        ");
        
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Her post için avatar kontrolü yap
        foreach ($posts as &$post) {
            if (empty($post['avatar'])) {
                $post['avatar'] = 'public/images/default-avatar.png'; // Varsayılan avatar yolu
            } else {
                // Avatar varsa, tam yolunu ekle
                $post['avatar'] = $post['avatar'];
            }
        }
        
        // Debug bilgisi ekle
        error_log('Posts data: ' . print_r($posts, true));
        
        echo json_encode(['success' => true, 'posts' => $posts]);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı hatası']);
}
