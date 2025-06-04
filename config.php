<?php
$host = 'localhost';
$dbname = 'u805253064_forumdb';
$username = 'u805253064_yemauser';
$password = 'YeMa6455';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    die();
}
