<?php
// Prevent any output before headers
ob_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    session_start();

    // Clear session
    $_SESSION = array();

    // Destroy the session
    session_destroy();

    // Clear remember token cookie if it exists
    if (isset($_COOKIE['remember_token'])) {
        $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
        setcookie('remember_token', '', time() - 3600, '/', '', $secure, true);
    }

    // Clear any previous output
    ob_clean();

    // Send success response
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Log the error
    error_log("Logout error: " . $e->getMessage());

    // Clear any previous output
    ob_clean();

    // Send error response
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred during logout',
        'success' => false
    ]);
}

// End output buffering and send
ob_end_flush();
?> 
