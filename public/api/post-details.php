<?php
// Basic error reporting
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

session_start();

try {
    // Check if config file exists
    $configFile = __DIR__ . '/../config.php';
    if (!file_exists($configFile)) {
        throw new Exception('Config file not found');
    }

    require_once $configFile; // <-- düzeltildi

    // PDO bağlantı kontrolü
    if (!isset($pdo) || !($pdo instanceof PDO)) {
        throw new Exception('Database connection not established');
    }

    // Get post ID from query string
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($postId === 0) {
        throw new Exception('Post ID is required');
    }

    // Get post details with user information
    $query = "SELECT p.*, u.username, u.avatar 
              FROM posts p 
              JOIN users u ON p.user_id = u.id 
              WHERE p.id = :post_id";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(['post_id' => $postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        throw new Exception('Post not found');
    }

    // Get comments for the post
    $commentsQuery = "SELECT c.*, u.username, u.avatar 
                     FROM comments c 
                     JOIN users u ON c.user_id = u.id 
                     WHERE c.post_id = :post_id 
                     ORDER BY c.created_at DESC"; // DESC olarak değiştirildi
    
    $stmt = $pdo->prepare($commentsQuery);
    $stmt->execute(['post_id' => $postId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Yorumları ana ve alt yorumlar olarak grupla
    $commentTree = [];
    foreach ($comments as $comment) {
        if (empty($comment['parent_comment_id'])) {
            $comment['replies'] = [];
            $commentTree[$comment['id']] = $comment;
        }
    }
    foreach ($comments as $comment) {
        if (!empty($comment['parent_comment_id']) && isset($commentTree[$comment['parent_comment_id']])) {
            if (!isset($commentTree[$comment['parent_comment_id']]['replies'])) {
                $commentTree[$comment['parent_comment_id']]['replies'] = [];
            }
            $commentTree[$comment['parent_comment_id']]['replies'][] = $comment;
        }
    }

    // Format the response
    $formattedPost = [
        'id' => $post['id'],
        'title' => $post['title'],
        'content' => strip_tags($post['content']), // HTML etiketlerini kaldır
        'created_at' => $post['created_at'],
        'author' => [
            'username' => $post['username'],
            'avatar' => $post['avatar'] ?? 'default-avatar.png'
        ]
    ];

    $formattedComments = array_values($commentTree);

    echo json_encode([
        'success' => true,
        'post' => $formattedPost,
        'comments' => $formattedComments
    ]);

} catch (Exception $e) {
    error_log("Post Details API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
