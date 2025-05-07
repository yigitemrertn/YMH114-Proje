<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Oturumu sonlandır
session_destroy();

// Remember token'ı temizle
if (isset($_COOKIE['remember_token'])) {
    $token = $_COOKIE['remember_token'];
    $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE token = ?");
    $stmt->execute([$token]);
    setcookie('remember_token', '', time() - 3600, '/');
}

echo json_encode(['success' => true]);
?> 