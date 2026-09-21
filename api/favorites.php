<?php
// API quản lý danh sách địa điểm yêu thích (Favorites)

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

if ($action === 'toggle' && !$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập!"], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'list' && !$userId) {
    echo json_encode(["status" => "success", "data" => []], JSON_UNESCAPED_UNICODE);
    exit();
}

switch ($action) {
    case 'list':
        $stmt = $db->prepare("SELECT destination_id FROM favorites WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $favs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(["status" => "success", "data" => $favs], JSON_UNESCAPED_UNICODE);
        break;

    case 'toggle':
        $destId = isset($data['destination_id']) ? $data['destination_id'] : '';
        if (empty($destId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID địa điểm!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $check = $db->prepare("SELECT id FROM favorites WHERE user_id = :user_id AND destination_id = :dest_id");
        $check->execute([':user_id' => $userId, ':dest_id' => $destId]);

        if ($check->rowCount() > 0) {
            $del = $db->prepare("DELETE FROM favorites WHERE user_id = :user_id AND destination_id = :dest_id");
            $del->execute([':user_id' => $userId, ':dest_id' => $destId]);
            echo json_encode(["status" => "success", "isFavorite" => false, "message" => "Đã xóa khỏi yêu thích!"], JSON_UNESCAPED_UNICODE);
        } else {
            $ins = $db->prepare("INSERT INTO favorites (user_id, destination_id) VALUES (:user_id, :dest_id)");
            $ins->execute([':user_id' => $userId, ':dest_id' => $destId]);
            echo json_encode(["status" => "success", "isFavorite" => true, "message" => "Đã lưu vào yêu thích!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}