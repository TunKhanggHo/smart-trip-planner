<?php
/**
 * API Quản Lý Đánh Giá Reviews:
 * 1. Lấy danh sách đánh giá theo ID điểm đến.
 * 2. Thêm đánh giá mới kèm chấm điểm sao.
 */

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
            echo json_encode(["status" => "error", "message" => "Thiếu ID điểm đến!"], JSON_UNESCAPED_UNICODE);
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
        $rating = max(1, min(5, $rating)); // Ép rating luôn nằm trong khoảng 1-5 sao
        $comment = isset($data['comment']) ? trim($data['comment']) : '';
        $datePosted = date('d/m/Y');

        if (empty($destId) || empty($comment)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập nội dung đánh giá!"], JSON_UNESCAPED_UNICODE);
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

        echo json_encode(["status" => "success", "message" => "Cảm ơn bạn đã gửi đánh giá!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'delete':
        requireAdmin(); // Chỉ Admin được xóa review của bất kỳ ai
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
        echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}
