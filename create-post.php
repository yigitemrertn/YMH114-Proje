<?php
session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// Sadece giriş yapan kullanıcılar post oluşturabilir
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor'
    ]);
    exit;
}

// Sadece POST isteklerine izin ver
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz istek metodu'
    ]);
    exit;
}

// JSON body'den verileri al
$data = json_decode(file_get_contents('php://input'), true);
$title = trim($data['title'] ?? '');
$category = trim($data['category'] ?? '');
// Tüm HTML etiketlerini kaldır, sadece düz metin kalsın
$content = trim($data['content'] ?? '');
$content = trim(html_entity_decode(strip_tags($content)));

if (empty($title) || empty($category) || empty($content)) {
    echo json_encode([
        'success' => false,
        'message' => 'Tüm alanlar zorunludur'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute([$_SESSION['user_id'], $title, $content]);

    echo json_encode([
        'success' => true,
        'message' => 'Konu başarıyla oluşturuldu'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Konu oluşturulurken hata oluştu: ' . $e->getMessage()
    ]);
}
?>
