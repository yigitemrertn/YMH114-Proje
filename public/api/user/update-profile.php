<?php
session_start();
require_once __DIR__ . '/../../config.php';

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
    $fullName = $_POST['fullName'] ?? null;
    $username = $_POST['username'] ?? null;
    $email = $_POST['email'] ?? null;
    $bio = $_POST['bio'] ?? null;
    $avatar = $_FILES['avatar'] ?? null;

    // Kullanıcı adı benzersiz mi?
    if ($username !== null && $username !== '') {
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
    if ($email !== null && $email !== '') {
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

        // Eski avatarı sil
        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $oldAvatar = $stmt->fetchColumn();
        if ($oldAvatar && file_exists('../../' . $oldAvatar)) {
            @unlink('../../' . $oldAvatar);
        }

        if (move_uploaded_file($avatar['tmp_name'], $targetPath)) {
            $avatarPath = 'uploads/avatars/' . $fileName;
        }
    }

    // Ad soyad ayır
    $name = null;
    $surname = null;
    if ($fullName !== null && trim($fullName) !== '') {
        $parts = explode(' ', trim($fullName), 2);
        $name = $parts[0];
        $surname = isset($parts[1]) ? $parts[1] : '';
    }

    // Sadece dolu olan alanları güncelle
    $fields = [];
    $params = [];

    if ($name !== null && $name !== '') {
        $fields[] = "name = ?";
        $params[] = $name;
    }
    if ($surname !== null && $surname !== '') {
        $fields[] = "surname = ?";
        $params[] = $surname;
    }
    if ($username !== null && $username !== '') {
        $fields[] = "username = ?";
        $params[] = $username;
    }
    if ($bio !== null && $bio !== '') {
        $fields[] = "bio = ?";
        $params[] = $bio;
    }
    if ($avatarPath) {
        $fields[] = "avatar = ?";
        $params[] = $avatarPath;
    }
    if ($email !== null && $email !== '') {
        $fields[] = "email = ?";
        $params[] = $email;
    }

    if (empty($fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'Güncellenecek bir alan yok.'
        ]);
        exit;
    }

    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
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
