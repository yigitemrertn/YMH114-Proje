<?php
require_once 'bootstrap.php';

use App\Auth\Auth;
use App\Security\Security;
use App\Database\Config;

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
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate input
    $rules = [
        'username' => 'required',
        'email' => 'email',
        'password' => 'required'
    ];

    $errors = Security::validateInput($data, $rules);
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input', 'details' => $errors]);
        exit;
    }

    try {
        $pdo = Config::getInstance()->getPDO();

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered']);
            exit;
        }

        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Username already taken']);
            exit;
        }

        // Hash password
        $hashedPassword = Security::hashPassword($data['password']);

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, name, surname) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            Security::sanitizeInput($data['username']),
            Security::sanitizeInput($data['email']),
            $hashedPassword,
            Security::sanitizeInput($data['name']),
            Security::sanitizeInput($data['surname'])
        ]);

        // Auto login after registration
        $auth = new Auth();
        $auth->login($data['email'], $data['password']);

        echo json_encode(['success' => true]);
    } catch (\Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'An error occurred during registration']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 
