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
    $theme = $_POST['theme'] ?? 'light';
    $fontSize = $_POST['fontSize'] ?? 'medium';

    // Validate theme
    $allowedThemes = ['light', 'dark', 'system'];
    if (!in_array($theme, $allowedThemes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz tema seçimi'
        ]);
        exit;
    }

    // Validate font size
    $allowedFontSizes = ['small', 'medium', 'large'];
    if (!in_array($fontSize, $allowedFontSizes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz yazı boyutu seçimi'
        ]);
        exit;
    }

    // Update appearance settings
    $stmt = $conn->prepare("
        UPDATE users 
        SET 
            theme = ?,
            font_size = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $theme,
        $fontSize,
        $_SESSION['user_id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Görünüm ayarları başarıyla güncellendi'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
} 