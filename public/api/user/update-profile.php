<?php
session_start();
require_once '../../config.php';

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
    $userId = $_SESSION['user_id'];
    $fullName = $_POST['fullName'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $avatar = $_FILES['avatar'] ?? null;

    // Kullanıcı adı benzersiz mi?
    if ($username) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$username, $userId]);
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Bu kullanıcı adı zaten kullanılıyor.'
            ]);
            exit;
        }
    }

    // E-posta benzersiz mi?
    if ($email) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Bu e-posta zaten kullanılıyor.'
            ]);
            exit;
        }
    }

    // Avatar yükleme
    $avatarPath = null;
    if ($avatar && $avatar['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024;
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

    // Ad soyad ayır
    $name = '';
    $surname = '';
    if ($fullName) {
        $parts = explode(' ', trim($fullName), 2);
        $name = $parts[0];
        $surname = isset($parts[1]) ? $parts[1] : '';
    }

    // Update profile
    $sql = "UPDATE users SET ";
    $params = [];
    if ($name) { $sql .= "name = ?, "; $params[] = $name; }
    if ($surname) { $sql .= "surname = ?, "; $params[] = $surname; }
    if ($username) { $sql .= "username = ?, "; $params[] = $username; }
    if ($bio !== null) { $sql .= "bio = ?, "; $params[] = $bio; }
    if ($avatarPath) { $sql .= "avatar = ?, "; $params[] = $avatarPath; }
    if ($email) { $sql .= "email = ?, "; $params[] = $email; }
    $sql = rtrim($sql, ', ');
    $sql .= " WHERE id = ?";
    $params[] = $userId;

    $stmt = $pdo->prepare($sql);
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
