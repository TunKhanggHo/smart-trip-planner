<?php
/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: config/database.php
 * NGƯỜI PHỤ TRÁCH: Khang & Nhóm Backend
 * ==============================================================================
 * Kết nối Cơ sở dữ liệu MySQL bằng PDO (PHP Data Objects)
 * Hỗ trợ chống SQL Injection và bảo mật cao
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

class Database {
    private $host = "localhost";
    private $db_name = "smart_trip_db";
    private $username = "root";
    private $password = ""; // Mặc định trên XAMPP mật khẩu là rỗng
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Lỗi kết nối CSDL MySQL: " . $exception->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        return $this->conn;
    }
}
