<?php
// API quản lý bình luận và đánh giá điểm đến

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/auth_helper.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$destId = isset($_GET['destination_id']) ? $_GET['destination_id'] : '';
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

switch ($action) {
    case 'list':
        if (empty($destId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID địa điểm!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM reviews WHERE destination_id = :dest_id ORDER BY id DESC");
        $stmt->execute([':dest_id' => $destId]);
        $reviews = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $reviews], JSON_UNESCAPED_UNICODE);
        break;

    case 'add':
        $destId = isset($data['destination_id']) ? $data['destination_id'] : '';
        $userName = isset($data['user_name']) ? trim($data['user_name']) : 'Khách du lịch';
        $rating = isset($data['rating']) ? (int)$data['rating'] : 5;
        $rating = max(1, min(5, $rating));
        $comment = isset($data['comment']) ? trim($data['comment']) : '';
        $datePosted = date('d/m/Y');

        if (empty($destId) || empty($comment)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nội dung đánh giá không được để trống!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("
            INSERT INTO reviews (destination_id, user_name, rating, comment, date_posted)
            VALUES (:dest_id, :user_name, :rating, :comment, :date_posted)
        ");
        $stmt->execute([
            ':dest_id' => $destId,
            ':user_name' => $userName,
            ':rating' => $rating,
            ':comment' => $comment,
            ':date_posted' => $datePosted
        ]);

        echo json_encode(["status" => "success", "message" => "Đã gửi đánh giá!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'delete':
        requireAdmin();
        $reviewId = isset($data['id']) ? (int)$data['id'] : 0;
        if (!$reviewId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID đánh giá!"], JSON_UNESCAPED_UNICODE);
            exit();
        }
        $stmt = $db->prepare("DELETE FROM reviews WHERE id = :id");
        $stmt->execute([':id' => $reviewId]);
        echo json_encode(["status" => "success", "message" => "Đã xóa đánh giá!"], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}