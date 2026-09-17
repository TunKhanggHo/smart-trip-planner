<?php

require_once __DIR__ . '/secrets.php';

class Mailer {
    // Cấu hình Google SMTP Server
    private static $smtpHost = 'smtp.gmail.com';
    private static $smtpPort = 465; // SSL port bảo mật
    private static $smtpUser = SMTP_EMAIL; // Lấy từ config/secrets.php (không commit lên Git)
    private static $smtpPass = SMTP_APP_PASSWORD; // Lấy từ config/secrets.php (không commit lên Git)
    private static $fromName = 'Smart Trip Planner Security';

    /**
     * Cập nhật thông tin tài khoản gửi nếu cần
     */
    public static function setSender($email, $appPassword = null) {
        self::$smtpUser = $email;
        if ($appPassword) {
            self::$smtpPass = str_replace(' ', '', $appPassword);
        }
    }

    /**
     * Gửi Email OTP với mẫu giao diện HTML chuyên nghiệp
     */
    public static function sendOtpEmail($toEmail, $otpCode, $fullName = 'Quý khách', $type = 'register') {
        $subject = ($type === 'register') 
            ? '🔐 [Smart Trip Planner] Mã xác thực OTP đăng ký tài khoản'
            : '🔒 [Smart Trip Planner] Mã xác thực OTP khôi phục mật khẩu';

        $actionText = ($type === 'register') ? 'đăng ký tài khoản mới' : 'đặt lại mật khẩu';

        $htmlBody = '
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
                .email-container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                .email-header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
                .email-header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
                .email-header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
                .email-body { padding: 30px 25px; color: #334155; line-height: 1.6; }
                .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
                .otp-box { text-align: center; margin: 25px 0; padding: 20px; background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; }
                .otp-label { font-size: 13px; font-weight: 600; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                .otp-code { font-size: 34px; font-weight: 800; color: #0284c7; letter-spacing: 8px; margin: 5px 0; font-family: "Courier New", Courier, monospace; }
                .otp-expire { font-size: 12px; color: #64748b; margin-top: 6px; }
                .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 15px; font-size: 13px; color: #92400e; border-radius: 4px; margin: 20px 0; }
                .email-footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>✈️ Smart Trip Planner</h1>
                    <p>Hệ thống Lên Lịch Trình Du Lịch Thông Minh</p>
                </div>
                <div class="email-body">
                    <div class="greeting">Xin chào ' . htmlspecialchars($fullName) . ',</div>
                    <p>Hệ thống nhận được yêu cầu <strong>' . $actionText . '</strong> trên Smart Trip Planner. Dưới đây là mã xác thực OTP của bạn:</p>
                    
                    <div class="otp-box">
                        <div class="otp-label">MÃ XÁC THỰC OTP (6 CHỮ SỐ)</div>
                        <div class="otp-code">' . $otpCode . '</div>
                        <div class="otp-expire">⏱️ Mã có hiệu lực trong vòng <strong>5 phút</strong></div>
                    </div>

                    <div class="warning-box">
                        ⚠️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Smart Trip Planner sẽ không bao giờ yêu cầu bạn cung cấp mã xác thực.
                    </div>

                    <p style="font-size: 13px; color: #64748b;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với ban quản trị.</p>
                </div>
                <div class="email-footer">
                    © 2026 Smart Trip Planner. Tất cả các quyền được bảo lưu.<br>
                    Email tự động từ máy chủ - Vui lòng không trả lời trực tiếp email này.
                </div>
            </div>
        </body>
        </html>';

        return self::sendSmtpMail($toEmail, $subject, $htmlBody);
    }

    /**
     * Giao thức socket SMTP chuẩn Google qua SSL Port 465
     */
    private static function sendSmtpMail($toEmail, $subject, $htmlBody) {
        $timeout = 15;
        $socket = @stream_socket_client("ssl://" . self::$smtpHost . ":" . self::$smtpPort, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT);

        if (!$socket) {
            error_log("SMTP Connect Error: $errstr ($errno)");
            return false;
        }

        $read = function() use ($socket) {
            $response = "";
            while ($str = fgets($socket, 515)) {
                $response .= $str;
                if (substr($str, 3, 1) == " ") break;
            }
            return $response;
        };

        $send = function($cmd) use ($socket) {
            fputs($socket, $cmd . "\r\n");
        };

        $read(); // Đọc chào ban đầu (220)

        $send("EHLO " . gethostname());
        $read();

        $send("AUTH LOGIN");
        $read();

        $send(base64_encode(self::$smtpUser));
        $read();

        $send(base64_encode(self::$smtpPass));
        $authRes = $read();

        if (strpos($authRes, "235") === false) {
            error_log("SMTP Auth Failed: " . $authRes);
            fclose($socket);
            return false;
        }

        $send("MAIL FROM: <" . self::$smtpUser . ">");
        $read();

        $send("RCPT TO: <" . $toEmail . ">");
        $read();

        $send("DATA");
        $read();

        $headers = [];
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        $headers[] = "From: =?UTF-8?B?" . base64_encode(self::$fromName) . "?= <" . self::$smtpUser . ">";
        $headers[] = "To: <" . $toEmail . ">";
        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
        $headers[] = "Date: " . date("r");
        $headers[] = "X-Mailer: SmartTripPlanner-PHP-Mailer";

        $message = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
        $send($message);
        $dataRes = $read();

        $send("QUIT");
        fclose($socket);

        return (strpos($dataRes, "250") !== false);
    }
}
