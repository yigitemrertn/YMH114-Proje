<?php
session_start();
use 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $username = $data['username'] ?? '';
    $name = $data['name'] ?? '';
    $surname = $data['surname'] ?? '';

    if (empty($email) || empty($password) || empty($username) || empty($name) || empty($surname)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tüm alanlar gereklidir']);
        exit;
    }

    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Bu email adresi zaten kullanılıyor']);
            exit;
        }

        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Bu kullanıcı adı zaten kullanılıyor']);
            exit;
        }

        // Create new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, username, name, surname) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$email, $hashedPassword, $username, $name, $surname]);

        $_SESSION['user_id'] = $pdo->lastInsertId();
        $_SESSION['email'] = $email;
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Bir hata oluştu: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
