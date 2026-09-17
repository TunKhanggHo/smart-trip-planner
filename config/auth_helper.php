<?php
/**
 * ==============================================================================
 * FILE: config/auth_helper.php
 * Các hàm dùng chung để kiểm tra quyền hạn ở phía Backend.
 *
 * QUAN TRỌNG: Đây là lớp bảo mật THẬT SỰ, không phải chỉ ẩn nút ở giao diện.
 * Bất kỳ file api/*.php nào có hành động chỉ dành riêng cho Admin
 * (xóa điểm đến, khóa tài khoản, xóa review người khác...) đều phải
 * gọi requireAdmin() ngay đầu action đó, để chặn cả những request gọi
 * thẳng vào API (qua Postman, F12...) chứ không đi qua giao diện web.
 * ==============================================================================
 */

/**
 * Chặn request nếu người gọi KHÔNG đăng nhập bằng tài khoản có role = admin.
 * Phải được gọi SAU khi đã session_start() ở file gọi nó.
 */
function requireAdmin() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Bạn không có quyền thực hiện hành động này! (Chỉ dành cho Admin)"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

/**
 * Chặn request nếu người gọi chưa đăng nhập (dùng lại cho các API cần login
 * nhưng chưa tiện sửa trực tiếp logic có sẵn).
 */
function requireLoginBackend() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Bạn cần đăng nhập để thực hiện thao tác này!"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
