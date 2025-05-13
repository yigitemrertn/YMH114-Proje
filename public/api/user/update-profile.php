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
    $fullName = $_POST['fullName'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $avatar = $_FILES['avatar'] ?? null;

    // Handle avatar upload
    $avatarPath = null;
    if ($avatar && $avatar['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($avatar['type'], $allowedTypes)) {
            echo json_encode([
                'success' => false,
                'message' => 'Geçersiz dosya türü. Sadece JPEG, PNG ve GIF dosyaları yükleyebilirsiniz.'
            ]);
            exit;
        }

        if ($avatar['size'] > $maxSize) {
            echo json_encode([
                'success' => false,
                'message' => 'Dosya boyutu çok büyük. Maksimum 5MB yükleyebilirsiniz.'
            ]);
            exit;
        }

        $uploadDir = '../../uploads/avatars/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = uniqid() . '_' . basename($avatar['name']);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($avatar['tmp_name'], $targetPath)) {
            $avatarPath = 'uploads/avatars/' . $fileName;
        }
    }

    // Update profile
    $sql = "UPDATE users SET full_name = ?, bio = ?";
    $params = [$fullName, $bio];

    if ($avatarPath) {
        $sql .= ", avatar = ?";
        $params[] = $avatarPath;
    }

    $sql .= " WHERE id = ?";
    $params[] = $_SESSION['user_id'];

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'success' => true,
        'message' => 'Profil başarıyla güncellendi'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage()
    ]);
} 