<?php
/**
 * API xử lý Xác thực:
 * 1. Đăng ký tài khoản mới (Mã hóa mật khẩu bằng BCRYPT).
 * 2. Đăng nhập hệ thống & cấp PHP Session.
 * 3. Lấy thông tin tài khoản hiện tại (Session Check).
 * 4. Cập nhật hồ sơ cá nhân (Profile update).
 * 5. Đăng xuất tài khoản.
 */

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once "../config/database.php";
require_once "../config/mail.php";

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Đọc payload JSON
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

switch ($action) {
    case 'send_register_otp':
        $fullName = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($fullName) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng điền đầy đủ họ tên, email và mật khẩu!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Địa chỉ email không đúng định dạng!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mật khẩu phải có ít nhất 6 ký tự!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Kiểm tra email đã tồn tại trong CSDL chưa
        $checkEmailStmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $checkEmailStmt->execute([':email' => $email]);
        if ($checkEmailStmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email này đã được đăng ký tài khoản trong hệ thống! Vui lòng dùng email khác."], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Sinh mã OTP 6 số ngẫu nhiên
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        $_SESSION['register_temp'] = [
            'name' => $fullName,
            'email' => $email,
            'password' => $password,
            'otp' => $otp,
            'time' => time()
        ];

        // Gửi Email OTP thật qua Google SMTP
        $mailSent = Mailer::sendOtpEmail($email, $otp, $fullName, 'register');

        echo json_encode([
            "status" => "success",
            "message" => "Mã xác thực OTP đã được gửi đến email của bạn! Vui lòng mở hộp thư Gmail để lấy mã.",
            "email" => $email,
            "mail_sent" => $mailSent
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'verify_register':
        $otp = isset($data['otp']) ? trim($data['otp']) : '';

        if (empty($otp)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập mã xác thực OTP!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!isset($_SESSION['register_temp']) || empty($_SESSION['register_temp'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Phiên đăng ký đã hết hạn. Vui lòng thử lại!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $regData = $_SESSION['register_temp'];
        if ($regData['otp'] !== $otp) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Mã OTP đúng -> Tạo tài khoản trong CSDL
        $fullName = $regData['name'];
        $email = $regData['email'];
        $password = $regData['password'];
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $avatar = strtoupper(mb_substr($fullName, 0, 1, 'UTF-8'));

        // Kiểm tra lại email lần cuối trước khi ghi vào CSDL, phòng trường hợp có người khác
        // vừa đăng ký trùng email trong lúc mình đang nhập mã OTP
        $recheckStmt = $db->prepare("SELECT email FROM users WHERE email = :email");
        $recheckStmt->execute([':email' => $email]);
        $conflict = $recheckStmt->fetch();
        if ($conflict) {
            unset($_SESSION['register_temp']);
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email này vừa được đăng ký bởi người khác. Vui lòng thử lại với email khác!"], JSON_UNESCAPED_UNICODE);
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
            // Bắt lỗi UNIQUE constraint nếu email vẫn lọt qua được 2 lớp kiểm tra trên
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email này đã tồn tại trong hệ thống!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $userId = $db->lastInsertId();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $fullName;

        // Xóa dữ liệu tạm sau khi tạo thành công
        unset($_SESSION['register_temp']);

        echo json_encode([
            "status" => "success",
            "message" => "Xác thực email thành công! Tài khoản của bạn đã được tạo.",
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
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập email và mật khẩu!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Chặn đăng nhập nếu tài khoản đã bị Admin khóa
            if (!empty($user['is_banned'])) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!"], JSON_UNESCAPED_UNICODE);
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
            echo json_encode(["status" => "error", "message" => "Email hoặc mật khẩu không chính xác!"], JSON_UNESCAPED_UNICODE);
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
            echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập!"], JSON_UNESCAPED_UNICODE);
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

        echo json_encode(["status" => "success", "message" => "Cập nhật hồ sơ thành công!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'logout':
        session_unset();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Đã đăng xuất!"], JSON_UNESCAPED_UNICODE);
        break;

    case 'forgot_password':
        $email = isset($data['email']) ? trim($data['email']) : '';
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập địa chỉ email!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $stmt = $db->prepare("SELECT id, full_name FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Email này chưa được đăng ký trong hệ thống!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Sinh mã OTP 6 số ngẫu nhiên và lưu vào session
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        $_SESSION['reset_email'] = $email;
        $_SESSION['reset_otp'] = $otp;
        $_SESSION['reset_otp_time'] = time();

        // Gửi Email OTP thật qua Google SMTP
        $mailSent = Mailer::sendOtpEmail($email, $otp, $user['full_name'], 'forgot');

        echo json_encode([
            "status" => "success",
            "message" => "Mã xác nhận OTP đã được gửi đến email của bạn! Vui lòng mở hộp thư Gmail để lấy mã.",
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
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ mã OTP và mật khẩu mới!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mật khẩu mới phải có ít nhất 6 ký tự!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Xác thực mã OTP trong session
        if (!isset($_SESSION['reset_otp']) || $_SESSION['reset_otp'] !== $otp || $_SESSION['reset_email'] !== $email) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mã OTP xác nhận không đúng hoặc đã hết hạn!"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Cập nhật mật khẩu mới vào bảng users
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $db->prepare("UPDATE users SET password = :password WHERE email = :email");
        $updateStmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);

        // Xóa OTP khỏi session sau khi đổi thành công
        unset($_SESSION['reset_otp']);
        unset($_SESSION['reset_email']);
        unset($_SESSION['reset_otp_time']);

        echo json_encode([
            "status" => "success",
            "message" => "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới."
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ!"], JSON_UNESCAPED_UNICODE);
        break;
}