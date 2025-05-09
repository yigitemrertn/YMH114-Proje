<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set up error logging to a file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

require_once __DIR__ . '/../bootstrap.php';

use App\Auth\Auth;
use App\Security\Security;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $rawInput = file_get_contents('php://input');
        error_log("Raw input: " . $rawInput);
        
        $data = json_decode($rawInput, true);
        error_log("Decoded data: " . print_r($data, true));

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON: ' . json_last_error_msg());
        }

        // Validate input
        $rules = [
            'email' => 'email',
            'password' => 'required'
        ];

        $errors = Security::validateInput($data, $rules);
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input', 'details' => $errors]);
            exit;
        }

        $auth = new Auth();
        $rememberMe = $data['rememberMe'] ?? false;
        error_log("Attempting login for email: " . $data['email']);

        if ($auth->login($data['email'], $data['password'], $rememberMe)) {
            error_log("Login successful for email: " . $data['email']);
            echo json_encode(['success' => true]);
        } else {
            error_log("Login failed for email: " . $data['email']);
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
        }
    } catch (\Exception $e) {
        error_log("Login error details: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'error' => 'An error occurred during login',
            'details' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 
