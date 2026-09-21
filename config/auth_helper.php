<?php
// Hàm kiểm tra và phân quyền truy cập cho Admin / Người dùng

function requireAdmin() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Bạn không có quyền thực hiện hành động này!"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

function requireLoginBackend() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Vui lòng đăng nhập trước!"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}