<?php
session_start();
require_once '../../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor.'
    ]);
    exit;
}

if (!isset($_POST['userId'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Kullanıcı ID\'si gerekli.'
    ]);
    exit;
}

try {
    $followerId = $_SESSION['user_id'];
    $followingId = $_POST['userId'];

    // Kendini takip etmeyi engelle
    if ($followerId == $followingId) {
        echo json_encode([
            'success' => false,
            'message' => 'Kendinizi takip edemezsiniz.'
        ]);
        exit;
    }

    // Kullanıcının var olduğunu kontrol et
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$followingId]);
    if (!$stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Kullanıcı bulunamadı.'
        ]);
        exit;
    }

    // Takip durumunu kontrol et
    $stmt = $pdo->prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$followerId, $followingId]);
    $isFollowing = $stmt->fetch();

    if ($isFollowing) {
        // Takibi bırak
        $stmt = $pdo->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$followerId, $followingId]);
        $message = 'Takip bırakıldı.';
    } else {
        // Takip et
        $stmt = $pdo->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)");
        $stmt->execute([$followerId, $followingId]);
        $message = 'Takip edildi.';
    }

    echo json_encode([
        'success' => true,
        'message' => $message
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
} 