<?php
// Prevent any output before headers
ob_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    session_start();

    // Include config file with absolute path
    require_once __DIR__ . '/../config.php';

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
                    $_SESSION['username'] = $user['username'];
                    if (isset($user['name'])) $_SESSION['name'] = $user['name'];
                    if (isset($user['surname'])) $_SESSION['surname'] = $user['surname'];
                    return true;
                }
            }
        }
        return false;
    }

    // Clear any previous output
    ob_clean();

    if (isset($_SESSION['user_id']) || checkRememberToken($pdo)) {
        echo json_encode(['loggedIn' => true]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
} catch (Exception $e) {
    // Log the error
    error_log("Status check error: " . $e->getMessage());

    // Clear any previous output
    ob_clean();

    // Send error response
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred while checking login status',
        'loggedIn' => false
    ]);
}

// End output buffering and send
ob_end_flush();
?> 
