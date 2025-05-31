<?php
// Basic error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Hata mesajlarını JSON olarak döndüreceğiz

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
    // Check if config file exists
    $configFile = __DIR__ . '/../config.php';
    if (!file_exists($configFile)) {
        throw new Exception('Config file not found');
    }

    require_once $configFile;

    // PDO bağlantı kontrolü
    if (!isset($pdo) || !($pdo instanceof PDO)) {
        throw new Exception('Database connection not established');
    }

    // Get posts with user information
    $query = "SELECT p.*, u.username, u.avatar,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formattedPosts = array_map(function($post) {
        return [
            'id' => $post['id'],
            'title' => $post['title'],
            'content' => strip_tags($post['content']), // HTML etiketlerini kaldır
            'created_at' => $post['created_at'],
            'updated_at' => $post['updated_at'],
            'author' => [
                'username' => $post['username'],
                'avatar' => $post['avatar'] ?? 'default-avatar.png'
            ],
            'stats' => [
                'comments' => (int)$post['comment_count']
                // 'likes' kaldırıldı
            ]
        ];
    }, $posts);
    
    echo json_encode([
        'success' => true,
        'posts' => $formattedPosts
    ]);
    
} catch (Exception $e) {
    error_log("Posts API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'php_version' => PHP_VERSION,
            'config_file' => $configFile ?? null,
            'db_connected' => isset($conn) && ($conn instanceof PDO),
            'error_trace' => $e->getTraceAsString()
        ]
    ]);
}
?>