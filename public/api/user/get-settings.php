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

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get user settings
    $stmt = $conn->prepare("
        SELECT 
            username,
            email,
            full_name,
            bio,
            avatar,
            theme,
            font_size,
            email_notifications,
            push_notifications,
            mention_notifications,
            profile_visibility,
            activity_visibility,
            search_visibility
        FROM users 
        WHERE id = ?
    ");

    $stmt->execute([$_SESSION['user_id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($settings) {
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Kullanıcı bulunamadı'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
} 