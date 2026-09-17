<?php
/**
 * ==============================================================================
 * FILE: config/secrets.example.php
 * File MẪU - an toàn để đẩy lên Git/GitHub, KHÔNG chứa key/mật khẩu thật.
 *
 * CÁCH DÙNG:
 * 1. Copy file này, đổi tên thành "secrets.php" (cùng thư mục config/).
 * 2. Điền thông tin thật của bạn vào các dòng define() bên dưới.
 * 3. File "secrets.php" đã được .gitignore bỏ qua, sẽ không bao giờ bị commit.
 * ==============================================================================
 */

// --- Thông tin gửi mail OTP qua Gmail SMTP ---
// Hướng dẫn lấy App Password: https://myaccount.google.com/apppasswords
define('SMTP_EMAIL', 'your_email@gmail.com');
define('SMTP_APP_PASSWORD', 'your_16_char_app_password');

// --- API Key Google Gemini AI ---
// Lấy key tại: https://aistudio.google.com/app/apikey
define('GEMINI_API_KEY', 'your_gemini_api_key');
