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

    $fullName = $_POST['fullName'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $avatar = $_FILES['avatar'] ?? null;

    // Kullanıcı adı benzersiz mi?
    if ($username) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$username, $_SESSION['user_id']]);
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Bu kullanıcı adı zaten kullanılıyor.'
            ]);
            exit;
        }
    }

    // E-posta değişikliği için onay maili gönder
    if ($email) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $_SESSION['user_id']]);
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Bu e-posta zaten kullanılıyor.'
            ]);
            exit;
        }
        // E-posta değişikliği için onay maili gönder (örnek)
        // Gerçek uygulamada token ile onay mekanizması kurmalısınız!
        $to = $email;
        $subject = "ForumFU E-posta Değişikliği Onayı";
        $message = "
        <html>
        <head>
        <title>E-posta Değişikliği Onayı</title>
        </head>
        <body>
        <h2>ForumFU E-posta Değişikliği</h2>
        <p>Merhaba,</p>
        <p>ForumFU hesabınız için bir e-posta değişikliği talebinde bulunuldu.</p>
        <p>Eğer bu işlemi siz yaptıysanız <a href='#'>EVET</a> butonuna, yapmadıysanız <a href='#'>HAYIR</a> butonuna tıklayınız.</p>
        <br>
        <a href='#' style='padding:10px 20px;background:#3498db;color:#fff;border-radius:6px;text-decoration:none;'>EVET</a>
        <a href='#' style='padding:10px 20px;background:#e74c3c;color:#fff;border-radius:6px;text-decoration:none;margin-left:10px;'>HAYIR</a>
        <br><br>
        <small>Bu e-posta bilgilendirme amaçlıdır.</small>
        </body>
        </html>
        ";
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: ForumFU <no-reply@forumfu.com>\r\n";
        // mail($to, $subject, $message, $headers); // Gerçek ortamda açın
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