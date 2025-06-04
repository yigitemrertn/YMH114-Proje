<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor'
    ]);
    exit;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz istek metodu'
    ]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get form data
    $emailNotifications = isset($_POST['emailNotifications']) ? 1 : 0;
    $pushNotifications = isset($_POST['pushNotifications']) ? 1 : 0;
    $mentionNotifications = isset($_POST['mentionNotifications']) ? 1 : 0;

    // Update notification settings
    $stmt = $conn->prepare("
        UPDATE users
        SET 
            email_notifications = ?,
            push_notifications = ?,
            mention_notifications = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $emailNotifications,
        $pushNotifications,
        $mentionNotifications,
        $_SESSION['user_id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Bildirim ayarları başarıyla güncellendi'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
}