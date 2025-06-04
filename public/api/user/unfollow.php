<?php
session_start();
use '../../../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Giriş yapmanız gerekiyor']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID\'si gerekli']);
    exit;
}

$followerId = $_SESSION['user_id'];
$followingId = $data['user_id'];

try {
    // Önce takip durumunu kontrol et
    $stmt = $pdo->prepare("SELECT COUNT(*) as is_following FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$followerId, $followingId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['is_following'] === 0) {
        echo json_encode(['success' => false, 'message' => 'Bu kullanıcıyı zaten takip etmiyorsunuz']);
        exit;
    }

    // Takipten çık
    $stmt = $pdo->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$followerId, $followingId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Takipten çıkma işlemi sırasında bir hata oluştu'
    ]);
}
