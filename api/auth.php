<?php
// API xử lý đăng nhập, đăng ký OTP, đổi mật khẩu và quản lý Session

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/mail.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

switch ($action) {
    case 'send_register_otp':
        $fullName = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($fullName) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập đủ họ tên, email và mật khẩu!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email không đúng định dạng!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mật khẩu tối thiểu 6 ký tự!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $checkEmailStmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $checkEmailStmt->execute([':email' => $email]);
        if ($checkEmailStmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email này đã tồn tại!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $otp = sprintf("%06d", mt_rand(100000, 999999));
        $_SESSION['register_temp'] = [
            'name' => $fullName,
            'email' => $email,
            'password' => $password,
            'otp' => $otp,
            'time' => time()
        ];

        $mailSent = Mailer::sendOtpEmail($email, $otp, $fullName, 'register');

        echo json_encode([
            "status" => "success",
            "message" => "Đã gửi mã OTP đến Gmail của bạn!",
            "email" => $email,
            "mail_sent" => $mailSent
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'verify_register':
        $otp = isset($data['otp']) ? trim($data['otp']) : '';

        if (empty($otp)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập mã OTP!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!isset($_SESSION['register_temp']) || empty($_SESSION['register_temp'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mã OTP đã hết hạn, vui lòng thử lại!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $regData = $_SESSION['register_temp'];
        if ($regData['otp'] !== $otp) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mã OTP không đúng!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $fullName = $regData['name'];
        $email = $regData['email'];
        $password = $regData['password'];
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $avatar = strtoupper(mb_substr($fullName, 0, 1, 'UTF-8'));

        $recheckStmt = $db->prepare("SELECT email FROM users WHERE email = :email");
        $recheckStmt->execute([':email' => $email]);
        if ($recheckStmt->fetch()) {
            unset($_SESSION['register_temp']);
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email này đã được đăng ký trước đó!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $insertStmt = $db->prepare("
                INSERT INTO users (full_name, email, password, avatar) 
                VALUES (:full_name, :email, :password, :avatar)
            ");
            $insertStmt->execute([
                ':full_name' => $fullName,
                ':email' => $email,
                ':password' => $hashedPassword,
                ':avatar' => $avatar
            ]);
        } catch (PDOException $e) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Lỗi: Email đã tồn tại trên hệ thống!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $userId = $db->lastInsertId();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $fullName;

        unset($_SESSION['register_temp']);

        echo json_encode([
            "status" => "success",
            "message" => "Đăng ký tài khoản thành công!",
            "user" => [
                "id" => $userId,
                "name" => $fullName,
                "email" => $email,
                "avatar" => $avatar
            ]
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'login':
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Chưa nhập email hoặc mật khẩu!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if (!empty($user['is_banned'])) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Tài khoản của bạn đã bị khóa!"], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_role'] = $user['role'];

            echo json_encode([
                "status" => "success",
                "message" => "Đăng nhập thành công!",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['full_name'],
                    "email" => $user['email'],
                    "phone" => $user['phone'],
                    "bio" => $user['bio'],
                    "avatar" => $user['avatar'] ?: strtoupper(mb_substr($user['full_name'], 0, 1, 'UTF-8')),
                    "role" => $user['role']
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Sai email hoặc mật khẩu!"], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'me':
        if (isset($_SESSION['user_id'])) {
            $stmt = $db->prepare("SELECT id, full_name AS name, email, phone, bio, avatar, role FROM users WHERE id = :id");
            $stmt->execute([':id' => $_SESSION['user_id']]);
            $user = $stmt->fetch();

            echo json_encode(["status" => "success", "isLoggedIn" => true, "user" => $user], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["status" => "success", "isLoggedIn" => false, "user" => null], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'update_profile':
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập trước!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $userId = $_SESSION['user_id'];
        $name = isset($data['name']) ? trim($data['name']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        $bio = isset($data['bio']) ? trim($data['bio']) : '';

        $stmt = $db->prepare("UPDATE users SET full_name = :name, phone = :phone, bio = :bio WHERE id = :id");
        $stmt->execute([
            ':name' => $name,
            ':phone' => $phone,
            ':bio' => $bio,
            ':id' => $userId
        ]);

        $_SESSION['user_name'] = $name;

        echo json_encode(["status" => "success", "message" => "Cập nhật thông tin thành công!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'logout':
        session_unset();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Đã đăng xuất thành công!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'forgot_password':
        $email = isset($data['email']) ? trim($data['email']) : '';
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập email!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT id, full_name FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Email này không tồn tại trong hệ thống!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $otp = sprintf("%06d", mt_rand(100000, 999999));
        $_SESSION['reset_email'] = $email;
        $_SESSION['reset_otp'] = $otp;
        $_SESSION['reset_otp_time'] = time();

        $mailSent = Mailer::sendOtpEmail($email, $otp, $user['full_name'], 'forgot');

        echo json_encode([
            "status" => "success",
            "message" => "Đã gửi mã xác thực OTP về email!",
            "email" => $email,
            "mail_sent" => $mailSent
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'reset_password':
        $email = isset($data['email']) ? trim($data['email']) : (isset($_SESSION['reset_email']) ? $_SESSION['reset_email'] : '');
        $otp = isset($data['otp']) ? trim($data['otp']) : '';
        $newPassword = isset($data['password']) ? $data['password'] : '';

        if (empty($email) || empty($otp) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập OTP và mật khẩu mới!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mật khẩu mới phải từ 6 ký tự trở lên!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!isset($_SESSION['reset_otp']) || $_SESSION['reset_otp'] !== $otp || $_SESSION['reset_email'] !== $email) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mã OTP không đúng hoặc đã hết hạn!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $db->prepare("UPDATE users SET password = :password WHERE email = :email");
        $updateStmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);

        unset($_SESSION['reset_otp']);
        unset($_SESSION['reset_email']);
        unset($_SESSION['reset_otp_time']);

        echo json_encode([
            "status" => "success",
            "message" => "Đặt lại mật khẩu thành công!"
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}