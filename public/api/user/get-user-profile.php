<?php
session_start();
require_once '../../../config.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID\'si gerekli']);
    exit;
}

$userId = $_GET['id'];
$currentUserId = $_SESSION['user_id'] ?? null;

try {
    // Kullanıcı bilgilerini al
    $stmt = $pdo->prepare("
        SELECT u.*, 
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
            (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
        FROM users u 
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
        exit;
    }

    // Eğer giriş yapmış kullanıcı varsa, takip durumunu kontrol et
    if ($currentUserId) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as is_following FROM follows WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$currentUserId, $userId]);
        $followStatus = $stmt->fetch(PDO::FETCH_ASSOC);
        $user['is_following'] = $followStatus['is_following'] > 0;
    } else {
        $user['is_following'] = false;
    }

    echo json_encode([
        'success' => true,
        'profile' => $user
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Profil bilgileri alınırken bir hata oluştu'
    ]);
} 