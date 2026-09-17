<?php
/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: api/destinations.php
 * NGƯỜI PHỤ TRÁCH: Khiêm, Vương
 * ==============================================================================
 * API xử lý:
 * 1. Lấy danh sách điểm đến du lịch (kèm tìm kiếm, lọc thể loại, ngân sách, sắp xếp).
 * 2. Lấy chi tiết điểm đến theo ID (kèm hoạt động, thời tiết, mẹo, đánh giá).
 * 3. Lấy danh sách thể loại phân loại (Categories).
 */

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/auth_helper.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$destId = isset($_GET['id']) ? $_GET['id'] : null;

// --- CÁC ACTION DÀNH RIÊNG CHO ADMIN (Thêm / Sửa / Xóa điểm đến) ---
if ($action === 'create') {
    requireAdmin();
    $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

    $newId = isset($data['id']) ? trim($data['id']) : '';
    $name = isset($data['name']) ? trim($data['name']) : '';
    $city = isset($data['city']) ? trim($data['city']) : '';
    $categoryId = isset($data['category_id']) ? (int)$data['category_id'] : 0;
    $image = isset($data['image']) ? trim($data['image']) : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    $avgCost = isset($data['avg_cost_per_day']) ? (int)$data['avg_cost_per_day'] : 500000;
    $badge = isset($data['badge']) && $data['badge'] !== '' ? trim($data['badge']) : 'Nổi bật';

    if (empty($newId) || empty($name) || empty($city) || !$categoryId || empty($image) || empty($description)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Vui lòng điền đầy đủ các trường bắt buộc!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $checkStmt = $db->prepare("SELECT id FROM destinations WHERE id = :id");
    $checkStmt->execute([':id' => $newId]);
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Mã ID điểm đến này đã tồn tại, vui lòng chọn mã khác!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $db->prepare("
        INSERT INTO destinations (id, name, city, category_id, badge, image, avg_cost_per_day, description)
        VALUES (:id, :name, :city, :category_id, :badge, :image, :avg_cost, :description)
    ");
    $stmt->execute([
        ':id' => $newId, ':name' => $name, ':city' => $city, ':category_id' => $categoryId,
        ':badge' => $badge, ':image' => $image, ':avg_cost' => $avgCost, ':description' => $description
    ]);

    echo json_encode(["status" => "success", "message" => "Đã thêm điểm đến mới!"], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'update') {
    requireAdmin();
    $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

    $editId = isset($data['id']) ? trim($data['id']) : '';
    if (empty($editId)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Thiếu ID điểm đến cần sửa!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $db->prepare("
        UPDATE destinations SET
            name = :name, city = :city, category_id = :category_id,
            badge = :badge, image = :image, avg_cost_per_day = :avg_cost, description = :description
        WHERE id = :id
    ");
    $stmt->execute([
        ':name' => trim($data['name']),
        ':city' => trim($data['city']),
        ':category_id' => (int)$data['category_id'],
        ':badge' => trim($data['badge']) ?: 'Nổi bật',
        ':image' => trim($data['image']),
        ':avg_cost' => (int)$data['avg_cost_per_day'],
        ':description' => trim($data['description']),
        ':id' => $editId
    ]);

    echo json_encode(["status" => "success", "message" => "Đã cập nhật điểm đến!"], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'delete') {
    requireAdmin();
    $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $delId = isset($data['id']) ? trim($data['id']) : '';

    if (empty($delId)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Thiếu ID điểm đến cần xóa!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $db->prepare("DELETE FROM destinations WHERE id = :id");
    $stmt->execute([':id' => $delId]);

    echo json_encode(["status" => "success", "message" => "Đã xóa điểm đến!"], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'categories') {
    // 1. Lấy danh mục
    $stmt = $db->prepare("SELECT * FROM categories ORDER BY id ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $categories], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($destId) {
    // 2. Lấy chi tiết 1 điểm đến
    $stmt = $db->prepare("
        SELECT d.*, c.name AS category_name, c.code AS category_code 
        FROM destinations d
        JOIN categories c ON d.category_id = c.id
        WHERE d.id = :id
    ");
    $stmt->execute([':id' => $destId]);
    $destination = $stmt->fetch();

    if (!$destination) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Không tìm thấy điểm đến này!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Lấy hoạt động mẫu
    $actStmt = $db->prepare("SELECT time_slot, title, cost FROM destination_activities WHERE destination_id = :id");
    $actStmt->execute([':id' => $destId]);
    $destination['activities'] = $actStmt->fetchAll();

    // Lấy đánh giá reviews
    $revStmt = $db->prepare("SELECT user_name, rating, comment, date_posted FROM reviews WHERE destination_id = :id ORDER BY id DESC");
    $revStmt->execute([':id' => $destId]);
    $destination['reviews'] = $revStmt->fetchAll();

    echo json_encode(["status" => "success", "data" => $destination], JSON_UNESCAPED_UNICODE);
    exit();
}

// 3. Lấy danh sách điểm đến với bộ lọc
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$budget = isset($_GET['budget']) && is_numeric($_GET['budget']) ? (int)$_GET['budget'] : null;
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'rating';

$sql = "
    SELECT d.*, c.name AS category_name, c.code AS category_code 
    FROM destinations d
    JOIN categories c ON d.category_id = c.id
    WHERE 1=1
";
$params = [];

if ($category !== 'all') {
    $sql .= " AND c.code = :category";
    $params[':category'] = $category;
}

if ($search !== '') {
    $sql .= " AND (d.name LIKE :search OR d.city LIKE :search OR d.description LIKE :search)";
    $params[':search'] = '%' . $search . '%';
}

if ($budget !== null) {
    $sql .= " AND d.avg_cost_per_day <= :budget";
    $params[':budget'] = $budget;
}

if ($sort === 'price_asc') {
    $sql .= " ORDER BY d.avg_cost_per_day ASC";
} elseif ($sort === 'price_desc') {
    $sql .= " ORDER BY d.avg_cost_per_day DESC";
} else {
    $sql .= " ORDER BY d.rating DESC";
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$destinations = $stmt->fetchAll();

echo json_encode([
    "status" => "success",
    "total" => count($destinations),
    "data" => $destinations
], JSON_UNESCAPED_UNICODE);
