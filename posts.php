<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Get posts with user information
    $stmt = $pdo->prepare("
        SELECT p.*, u.username, u.name, u.surname,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 20
    ");
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the posts data
    $formatted_posts = array_map(function($post) {
        return [
            'id' => $post['id'],
            'title' => $post['title'],
            'content' => $post['content'],
            'created_at' => $post['created_at'],
            'author' => [
                'username' => $post['username'],
                'name' => $post['name'],
                'surname' => $post['surname']
            ],
            'stats' => [
                'comments' => $post['comment_count'],
                'likes' => 0 // Like feature is disabled
            ]
        ];
    }, $posts);

    echo json_encode([
        'success' => true,
        'posts' => $formatted_posts
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Posts could not be loaded'
    ]);
}
?> 