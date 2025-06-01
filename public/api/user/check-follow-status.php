<?php
session_start();
require_once '../../../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Oturum açmanız gerekiyor']);
    exit;
}
if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID\'si gerekli']);
    exit;
}

$currentUserId = $_SESSION['user_id'];
$userId = $_GET['user_id'];

$stmt = $pdo->prepare("SELECT COUNT(*) as is_following FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$currentUserId, $userId]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['is_following' => $result['is_following'] > 0]);
?>
