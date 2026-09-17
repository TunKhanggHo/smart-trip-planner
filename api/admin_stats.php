<?php
/**
 * API Thống kê tổng quan cho Trang Quản Trị (chỉ Admin được xem).
 */

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/auth_helper.php";

$database = new Database();
$db = $database->getConnection();

requireAdmin(); // Chặn ngay nếu không phải Admin

$stats = [];

$stats['totalUsers'] = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
$stats['totalDestinations'] = (int)$db->query("SELECT COUNT(*) FROM destinations")->fetchColumn();
$stats['totalTrips'] = (int)$db->query("SELECT COUNT(*) FROM trips")->fetchColumn();
$stats['totalReviews'] = (int)$db->query("SELECT COUNT(*) FROM reviews")->fetchColumn();

// Top 5 điểm đến có rating cao nhất (kèm số lượng review thực tế đã đăng)
$topStmt = $db->query("
    SELECT d.id, d.name, d.city, d.rating,
           (SELECT COUNT(*) FROM reviews r WHERE r.destination_id = d.id) AS real_review_count
    FROM destinations d
    ORDER BY d.rating DESC, real_review_count DESC
    LIMIT 5
");
$stats['topDestinations'] = $topStmt->fetchAll();

echo json_encode(["status" => "success", "data" => $stats], JSON_UNESCAPED_UNICODE);
