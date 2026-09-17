<?php
/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: api/favorites.php
 * NGƯỜI PHỤ TRÁCH: Vương, Khiêm
 * ==============================================================================
 * API Quản Lý Địa Điểm Yêu Thích (Favorites):
 * 1. Lấy danh sách ID các điểm đến đã thả tim.
 * 2. Thêm / Xóa yêu thích (Toggle).
 */

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null; // null nếu chưa đăng nhập (KHÔNG mặc định user_id=1 nữa)

$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

if ($action === 'toggle' && !$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Bạn cần đăng nhập để lưu yêu thích!"], JSON_UNESCAPED_UNICODE);
    exit();
}

// Nếu chưa đăng nhập, coi như chưa có địa điểm yêu thích nào (không lộ dữ liệu người khác)
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

        // Kiểm tra xem đã yêu thích chưa
        $check = $db->prepare("SELECT id FROM favorites WHERE user_id = :user_id AND destination_id = :dest_id");
        $check->execute([':user_id' => $userId, ':dest_id' => $destId]);

        if ($check->rowCount() > 0) {
            // Đã có -> Xóa
            $del = $db->prepare("DELETE FROM favorites WHERE user_id = :user_id AND destination_id = :dest_id");
            $del->execute([':user_id' => $userId, ':dest_id' => $destId]);
            echo json_encode(["status" => "success", "isFavorite" => false, "message" => "Đã xóa khỏi danh sách yêu thích!"], JSON_UNESCAPED_UNICODE);
        } else {
            // Chưa có -> Thêm
            $ins = $db->prepare("INSERT INTO favorites (user_id, destination_id) VALUES (:user_id, :dest_id)");
            $ins->execute([':user_id' => $userId, ':dest_id' => $destId]);
            echo json_encode(["status" => "success", "isFavorite" => true, "message" => "Đã lưu vào danh sách yêu thích!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}
