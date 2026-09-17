<?php
/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: api/expenses.php
 * NGƯỜI PHỤ TRÁCH: Huy
 * ==============================================================================
 * API Sổ Chi Tiêu Thực Tế (Expense Tracker):
 * 1. Lấy danh sách các khoản chi tiêu.
 * 2. Thêm khoản chi tiêu mới.
 * 3. Xóa khoản chi tiêu.
 */

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
    echo json_encode(["status" => "error", "message" => "Bạn cần đăng nhập để dùng sổ chi tiêu!"], JSON_UNESCAPED_UNICODE);
    exit();
}

switch ($action) {
    case 'list':
        $stmt = $db->prepare("SELECT * FROM trip_expenses WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute([':user_id' => $userId]);
        $expenses = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $expenses], JSON_UNESCAPED_UNICODE);
        break;

    case 'add':
        $id = isset($data['id']) ? $data['id'] : 'exp_' . time();
        $title = isset($data['title']) ? trim($data['title']) : '';
        $amount = isset($data['amount']) ? (int)$data['amount'] : 0;
        $category = isset($data['category']) ? $data['category'] : 'Ăn uống';
        $expenseDate = isset($data['date']) ? $data['date'] : date('d/m/Y');

        if (empty($title) || $amount <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập tên khoản chi và số tiền hợp lệ!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("
            INSERT INTO trip_expenses (id, user_id, title, amount, category, expense_date)
            VALUES (:id, :user_id, :title, :amount, :category, :expense_date)
        ");
        $stmt->execute([
            ':id' => $id,
            ':user_id' => $userId,
            ':title' => $title,
            ':amount' => $amount,
            ':category' => $category,
            ':expense_date' => $expenseDate
        ]);

        echo json_encode(["status" => "success", "message" => "Đã ghi nhận khoản chi tiêu!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'delete':
        $id = isset($data['id']) ? $data['id'] : '';
        if ($id) {
            $stmt = $db->prepare("DELETE FROM trip_expenses WHERE id = :id AND user_id = :user_id");
            $stmt->execute([':id' => $id, ':user_id' => $userId]);
            echo json_encode(["status" => "success", "message" => "Đã xóa khoản chi!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}
