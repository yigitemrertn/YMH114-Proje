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
    $profileVisibility = isset($_POST['profileVisibility']) ? 1 : 0;
    $activityVisibility = isset($_POST['activityVisibility']) ? 1 : 0;
    $searchVisibility = isset($_POST['searchVisibility']) ? 1 : 0;

    // Update privacy settings
    $stmt = $conn->prepare("
        UPDATE users
        SET 
            profile_visibility = ?,
            activity_visibility = ?,
            search_visibility = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $profileVisibility,
        $activityVisibility,
        $searchVisibility,
        $_SESSION['user_id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Gizlilik ayarları başarıyla güncellendi'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
}