<?php
session_start();
require_once __DIR__ . '/public/config.php';

header('Content-Type: application/json');

try {
    // Google News RSS feed URL'si
    $rss_url = 'https://news.google.com/rss/search?q=teknoloji&hl=tr&gl=TR&ceid=TR:tr';
    
    // RSS feed'i oku
    $rss = simplexml_load_file($rss_url);
    
    if ($rss === false) {
        throw new Exception('Haberler yüklenemedi');
    }

    $news = [];
    $count = 0;
    
    // Her bir haber öğesini işle
    foreach ($rss->channel->item as $item) {
        if ($count >= 5) break; // Hatalı if düzeltildi
        // Sadece ilk 5 haberi al
        
        // Haber başlığından kaynak bilgisini ayır
        $title_parts = explode(' - ', (string)$item->title);
        $title = $title_parts[0];
        $source = isset($title_parts[1]) ? $title_parts[1] : 'Google News';
        
        // Haber açıklamasını temizle
        $description = strip_tags((string)$item->description);
        
        $news[] = [
            'id' => $count + 1,
            'title' => $title,
            'description' => $description,
            'url' => (string)$item->link,
            'source' => $source,
            'publishedAt' => (string)$item->pubDate
        ];
        
        $count++;
    }

    echo json_encode([
        'success' => true,
        'news' => $news
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Haberler yüklenemedi: ' . $e->getMessage()
    ]);
}
