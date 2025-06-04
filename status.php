<?php
session_start();
use 'config.php';

header('Content-Type: application/json');

function checkRememberToken($pdo) {
    if (isset($_COOKIE['remember_token'])) {
        $token = $_COOKIE['remember_token'];
        $stmt = $pdo->prepare("SELECT user_id FROM remember_tokens WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $result = $stmt->fetch();
        
        if ($result) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$result['user_id']]);
            $user = $stmt->fetch();
            
            if ($user) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                return true;
            }
        }
    }
    return false;
}

$response = [
    'loggedIn' => isset($_SESSION['user_id']) || checkRememberToken($pdo),
    'userId' => $_SESSION['user_id'] ?? null
];

echo json_encode($response);
