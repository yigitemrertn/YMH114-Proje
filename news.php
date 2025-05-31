<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Get featured posts (posts with most comments in the last 7 days)
    $stmt = $pdo->prepare("
        SELECT p.*, u.username, u.name, u.surname,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY comment_count DESC
        LIMIT 5
    ");
    $stmt->execute();
    $featured_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the news data
    $formatted_news = array_map(function($post) {
        return [
            'id' => $post['id'],
            'title' => $post['title'],
            'description' => substr(strip_tags($post['content']), 0, 150) . '...',
            'url' => "/detailed-post.html?id=" . $post['id'],
            'source' => '@' . $post['username'],
            'publishedAt' => $post['created_at']
        ];
    }, $featured_posts);

    echo json_encode([
        'success' => true,
        'news' => $formatted_news
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'News could not be loaded'
    ]);
}
?> 