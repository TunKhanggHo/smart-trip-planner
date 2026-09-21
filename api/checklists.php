<?php
// API quản lý Checklist hành lý cá nhân

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập!"], JSON_UNESCAPED_UNICODE);
    exit();
}

switch ($action) {
    case 'list':
        $stmt = $db->prepare("SELECT * FROM trip_checklists WHERE user_id = :user_id ORDER BY id ASC");
        $stmt->execute([':user_id' => $userId]);
        $items = $stmt->fetchAll();

        if (empty($items)) {
            $defaultItems = [
                ['chk_' . $userId . '_1', 'Giấy tờ tùy thân', 'CCCD / Hộ chiếu bản gốc', 1],
                ['chk_' . $userId . '_2', 'Giấy tờ tùy thân', 'Bằng lái xe & Giấy tờ xe', 1],
                ['chk_' . $userId . '_3', 'Giấy tờ tùy thân', 'Thẻ ATM / Tiền mặt vừa đủ', 0],
                ['chk_' . $userId . '_4', 'Đồ điện tử', 'Điện thoại & Củ cáp sạc nhanh', 1],
                ['chk_' . $userId . '_5', 'Đồ điện tử', 'Sạc dự phòng dung lượng cao', 0],
                ['chk_' . $userId . '_6', 'Trang phục', 'Quần áo phù hợp thời tiết', 0],
                ['chk_' . $userId . '_7', 'Y tế & Cá nhân', 'Kem chống nắng & Thuốc men cơ bản', 0]
            ];
            $ins = $db->prepare("INSERT INTO trip_checklists (id, user_id, category, name, is_checked) VALUES (?, ?, ?, ?, ?)");
            foreach ($defaultItems as $row) {
                $ins->execute([$row[0], $userId, $row[1], $row[2], $row[3]]);
            }
            $stmt->execute([':user_id' => $userId]);
            $items = $stmt->fetchAll();
        }

        $formatted = array_map(function($item) {
            return [
                'id' => $item['id'],
                'category' => $item['category'],
                'name' => $item['name'],
                'checked' => (bool)$item['is_checked']
            ];
        }, $items);

        echo json_encode(["status" => "success", "data" => $formatted], JSON_UNESCAPED_UNICODE);
        break;

    case 'toggle':
        $id = isset($data['id']) ? $data['id'] : '';
        if ($id) {
            $stmt = $db->prepare("UPDATE trip_checklists SET is_checked = NOT is_checked WHERE id = :id AND user_id = :user_id");
            $stmt->execute([':id' => $id, ':user_id' => $userId]);
            echo json_encode(["status" => "success", "message" => "Cập nhật thành công!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'add':
        $id = isset($data['id']) ? $data['id'] : 'chk_' . time();
        $category = isset($data['category']) ? $data['category'] : 'Khác';
        $name = isset($data['name']) ? trim($data['name']) : '';

        if (!empty($name)) {
            $stmt = $db->prepare("INSERT INTO trip_checklists (id, user_id, category, name, is_checked) VALUES (:id, :user_id, :category, :name, 0)");
            $stmt->execute([':id' => $id, ':user_id' => $userId, ':category' => $category, ':name' => $name]);
            echo json_encode(["status" => "success", "message" => "Thêm món đồ thành công!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'delete':
        $id = isset($data['id']) ? $data['id'] : '';
        if ($id) {
            $stmt = $db->prepare("DELETE FROM trip_checklists WHERE id = :id AND user_id = :user_id");
            $stmt->execute([':id' => $id, ':user_id' => $userId]);
            echo json_encode(["status" => "success", "message" => "Đã xóa món đồ!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}