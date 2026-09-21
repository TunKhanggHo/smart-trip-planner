<?php
// API lưu chuyến đi, tạo lịch trình chi tiết và quản lý chuyến đi cá nhân

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

$actionsRequireLogin = ['create', 'delete', 'update_name'];
if (in_array($action, $actionsRequireLogin) && !$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập trước!"], JSON_UNESCAPED_UNICODE);
    exit();
}

switch ($action) {
    case 'list':
        if (!$userId) {
            echo json_encode(["status" => "success", "data" => []], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM trips WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute([':user_id' => $userId]);
        $trips = $stmt->fetchAll();

        foreach ($trips as &$trip) {
            $schStmt = $db->prepare("SELECT day_number, time_slot, title, cost FROM trip_schedules WHERE trip_id = :trip_id ORDER BY day_number ASC, id ASC");
            $schStmt->execute([':trip_id' => $trip['id']]);
            $rawSchedules = $schStmt->fetchAll();

            $days = [];
            foreach ($rawSchedules as $item) {
                $dayNum = $item['day_number'];
                if (!isset($days[$dayNum])) {
                    $days[$dayNum] = [
                        'dayNumber' => $dayNum,
                        'activities' => [],
                        'dayTotal' => 0
                    ];
                }
                $days[$dayNum]['activities'][] = [
                    'time' => $item['time_slot'],
                    'title' => $item['title'],
                    'cost' => (int)$item['cost']
                ];
                $days[$dayNum]['dayTotal'] += (int)$item['cost'];
            }
            $trip['schedule'] = array_values($days);
            $trip['destinationName'] = $trip['destination_name'];
            $trip['totalCostPerPerson'] = (int)$trip['total_cost_per_person'];
            $trip['createdAt'] = date('d/m/Y', strtotime($trip['created_at']));
        }

        echo json_encode(["status" => "success", "data" => $trips], JSON_UNESCAPED_UNICODE);
        break;

    case 'create':
        $tripId = isset($data['id']) ? $data['id'] : 'trip_' . time();
        $destId = isset($data['destinationId']) ? $data['destinationId'] : '';
        $destName = isset($data['destinationName']) ? $data['destinationName'] : '';
        $city = isset($data['city']) ? $data['city'] : '';
        $image = isset($data['image']) ? $data['image'] : '';
        $startDate = isset($data['startDate']) ? $data['startDate'] : date('Y-m-d');
        $days = isset($data['days']) ? (int)$data['days'] : 3;
        $people = isset($data['people']) ? (int)$data['people'] : 2;
        $vehicle = isset($data['vehicle']) ? $data['vehicle'] : 'xe máy';
        $style = isset($data['style']) ? $data['style'] : 'chill';
        $userBudget = isset($data['userBudget']) ? (int)$data['userBudget'] : 0;
        $totalCost = isset($data['totalCostPerPerson']) ? (int)$data['totalCostPerPerson'] : 0;
        $schedule = isset($data['schedule']) ? $data['schedule'] : [];

        $stmt = $db->prepare("
            INSERT INTO trips (id, user_id, destination_id, destination_name, city, image, start_date, days, people, vehicle, style, user_budget, total_cost_per_person)
            VALUES (:id, :user_id, :dest_id, :dest_name, :city, :image, :start_date, :days, :people, :vehicle, :style, :user_budget, :total_cost)
        ");
        $stmt->execute([
            ':id' => $tripId,
            ':user_id' => $userId,
            ':dest_id' => $destId,
            ':dest_name' => $destName,
            ':city' => $city,
            ':image' => $image,
            ':start_date' => $startDate,
            ':days' => $days,
            ':people' => $people,
            ':vehicle' => $vehicle,
            ':style' => $style,
            ':user_budget' => $userBudget,
            ':total_cost' => $totalCost
        ]);

        if (!empty($schedule)) {
            $schStmt = $db->prepare("
                INSERT INTO trip_schedules (trip_id, day_number, time_slot, title, cost)
                VALUES (:trip_id, :day_number, :time_slot, :title, :cost)
            ");
            foreach ($schedule as $day) {
                $dayNumber = $day['dayNumber'];
                foreach ($day['activities'] as $act) {
                    $schStmt->execute([
                        ':trip_id' => $tripId,
                        ':day_number' => $dayNumber,
                        ':time_slot' => $act['time'],
                        ':title' => $act['title'],
                        ':cost' => $act['cost']
                    ]);
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "Lưu chuyến đi thành công!", "trip_id" => $tripId], JSON_UNESCAPED_UNICODE);
        break;

    case 'delete':
        $tripId = isset($data['id']) ? $data['id'] : '';
        if (!$tripId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID chuyến đi!"], JSON_UNESCAPED_UNICODE);
            break;
        }

        $ownerStmt = $db->prepare("SELECT user_id FROM trips WHERE id = :id");
        $ownerStmt->execute([':id' => $tripId]);
        $tripOwner = $ownerStmt->fetch();

        if (!$tripOwner) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Chuyến đi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            break;
        }
        if ((int)$tripOwner['user_id'] !== $userId) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Bạn không có quyền xóa chuyến đi này!"], JSON_UNESCAPED_UNICODE);
            break;
        }

        $stmt = $db->prepare("DELETE FROM trips WHERE id = :id AND user_id = :user_id");
        $stmt->execute([':id' => $tripId, ':user_id' => $userId]);
        echo json_encode(["status" => "success", "message" => "Đã xóa chuyến đi thành công!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'update_name':
        $tripId = isset($data['id']) ? $data['id'] : '';
        $newName = isset($data['name']) ? trim($data['name']) : '';
        if (!$tripId || !$newName) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin!"], JSON_UNESCAPED_UNICODE);
            break;
        }

        $ownerStmt = $db->prepare("SELECT user_id FROM trips WHERE id = :id");
        $ownerStmt->execute([':id' => $tripId]);
        $tripOwner = $ownerStmt->fetch();

        if (!$tripOwner) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Chuyến đi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            break;
        }
        if ((int)$tripOwner['user_id'] !== $userId) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Bạn không có quyền đổi tên chuyến đi này!"], JSON_UNESCAPED_UNICODE);
            break;

        }

        $stmt = $db->prepare("UPDATE trips SET destination_name = :name WHERE id = :id AND user_id = :user_id");
        $stmt->execute([':name' => $newName, ':id' => $tripId, ':user_id' => $userId]);
        echo json_encode(["status" => "success", "message" => "Đã đổi tên chuyến đi thành công!"], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}