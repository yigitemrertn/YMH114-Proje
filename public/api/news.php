<?php
// Basic error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

// Google News RSS feed URL
$url = "https://news.google.com/rss/search?q=teknoloji&hl=tr&gl=TR&ceid=TR:tr";

try {
    // Initialize cURL session
    $ch = curl_init();
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Execute cURL session
    $response = curl_exec($ch);
    
    // Check for cURL errors
    if (curl_errno($ch)) {
        throw new Exception('cURL Error: ' . curl_error($ch));
    }
    
    // Get HTTP status code
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode !== 200) {
        throw new Exception("Failed to fetch RSS feed (HTTP $httpCode)");
    }
    
    // Close cURL session
    curl_close($ch);
    
    if ($response === FALSE) {
        throw new Exception('Failed to fetch news feed');
    }
    
    // Parse XML
    $xml = simplexml_load_string($response);
    if ($xml === false) {
        throw new Exception('Failed to parse XML feed');
    }
    
    // Format the news data
    $formattedNews = [];
    $count = 0;
    
    foreach ($xml->channel->item as $item) {
        if ($count >= 4) break;
        
        // Extract the actual URL from the Google News redirect URL
        $url = (string)$item->link;
        $title = (string)$item->title;
        $description = (string)$item->description;
        $pubDate = (string)$item->pubDate;
        
        // Clean up the title (remove source name)
        $title = preg_replace('/ - .*$/', '', $title);
        
        $formattedNews[] = [
            'title' => $title,
            'description' => strip_tags($description),
            'url' => $url,
            'publishedAt' => date('c', strtotime($pubDate)),
            'source' => (string)$item->source
        ];
        
        $count++;
    }
    
    echo json_encode([
        'success' => true,
        'news' => $formattedNews
    ]);
    
} catch (Exception $e) {
    error_log("News Feed Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'php_version' => PHP_VERSION,
            'curl_enabled' => function_exists('curl_init'),
            'ssl_enabled' => extension_loaded('openssl'),
            'feed_url' => $url
        ]
    ]);
}
?> 