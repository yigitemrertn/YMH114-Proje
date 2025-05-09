<?php
require_once 'bootstrap.php';

use App\Database\Config;

header('Content-Type: application/json');

try {
    $config = Config::getInstance();
    $pdo = $config->getPDO();
    
    // Test if we can query the database
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'tables' => $tables
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
} 