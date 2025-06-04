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
    $email = $_POST['email'] ?? '';
    $currentPassword = $_POST['currentPassword'] ?? '';
    $newPassword = $_POST['newPassword'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz email adresi'
        ]);
        exit;
    }

    // Check if email is already taken
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $_SESSION['user_id']]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Bu email adresi zaten kullanılıyor'
        ]);
        exit;
    }

    // Get current user data
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Mevcut şifre yanlış'
        ]);
        exit;
    }

    // Update email
    $stmt = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
    $stmt->execute([$email, $_SESSION['user_id']]);

    // Update password if provided
    if (!empty($newPassword)) {
        if ($newPassword !== $confirmPassword) {
            echo json_encode([
                'success' => false,
                'message' => 'Yeni şifreler eşleşmiyor'
            ]);
            exit;
        }

        if (strlen($newPassword) < 8) {
            echo json_encode([
                'success' => false,
                'message' => 'Şifre en az 8 karakter olmalıdır'
            ]);
            exit;
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $_SESSION['user_id']]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Hesap bilgileri başarıyla güncellendi'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
}