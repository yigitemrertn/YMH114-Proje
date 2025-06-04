<?php
// Database configuration
$host = 'localhost';
$dbname = 'u805253064_forumdb';
$username = 'u805253064_yemauser';
$password = 'YeMa6455';


try {
    // Create PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Log error and return JSON response
    error_log("Database Connection Error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'debug' => [
            'message' => $e->getMessage()
        ]
    ]);
    exit();
}
