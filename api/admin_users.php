<?php
// API quản lý tài khoản người dùng và khóa/mở tài khoản cho Admin

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/auth_helper.php";

$database = new Database();
$db = $database->getConnection();

requireAdmin();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

switch ($action) {
    case 'list':
        $stmt = $db->query("SELECT id, full_name, email, phone, role, is_banned, created_at FROM users ORDER BY id ASC");
        $users = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $users], JSON_UNESCAPED_UNICODE);
        break;

    case 'ban':
    case 'unban':
        $targetId = isset($data['id']) ? (int)$data['id'] : 0;
        if (!$targetId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID người dùng!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($targetId === (int)$_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Không thể tự khóa tài khoản của chính mình!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $newStatus = ($action === 'ban') ? 1 : 0;
        $stmt = $db->prepare("UPDATE users SET is_banned = :status WHERE id = :id");
        $stmt->execute([':status' => $newStatus, ':id' => $targetId]);

        echo json_encode([
            "status" => "success",
            "message" => $action === 'ban' ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản!"
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}