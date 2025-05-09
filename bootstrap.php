<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Config;
use App\Config\Logger;

// Load environment variables
$config = Config::getInstance();

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', !$config->isDevelopment());
session_start();

// Set error reporting based on environment
if ($config->isDebug()) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set default timezone
date_default_timezone_set('UTC');

// Initialize logger
$logger = Logger::getInstance();

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/src/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Initialize error handling
set_error_handler(function($errno, $errstr, $errfile, $errline) use ($logger) {
    $logger->error("Error [$errno] $errstr on line $errline in file $errfile");
    return true;
});

set_exception_handler(function($exception) use ($logger) {
    $logger->error($exception->getMessage(), [
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'An internal server error occurred',
        'message' => $config->isDebug() ? $exception->getMessage() : 'Please try again later'
    ]);
}); 