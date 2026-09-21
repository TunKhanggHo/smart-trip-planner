# ✈️ SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
> **Đồ Án Môn Học:** Lập Trình Web  
> **Công Nghệ Sử Dụng:** HTML5, CSS3, JavaScript (ES6+), PHP (PDO), MySQL  
> **Phiên Bản:** Full-Stack v2.0 (Frontend + Backend PHP/MySQL)  

---

## 👥 1. BẢNG PHÂN CÔNG CÔNG VIỆC NHÓM (5 THÀNH VIÊN)

| STT | Module | Người phụ trách | File HTML | File Frontend (JS/CSS) | File Backend (PHP) | Chi tiết công việc đã hoàn thành |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Trang chủ + Tích hợp** | **Khang** *(Leader)* | [`index.html`](index.html) | `style.css`, `responsive.css`, `animation.css`, `main.js` | `api/destinations.php` (list) | Quản lý dự án, thiết kế Core Design System, Header, Navbar sticky, Hero tìm kiếm, Thống kê, Điểm đến hot, CTA, Footer. |
| **2** | **Khám phá địa điểm** | **Khiêm** | [`destinations.html`](destinations.html) | `destinations.js` | `api/destinations.php` (list, filter), `api/favorites.php` | Tìm kiếm tức thì, bộ lọc theo phong cách du lịch, khoảng ngân sách, sắp xếp giá/đánh giá, nút lưu Yêu thích (❤️). |
| **3** | **Chi tiết địa điểm** | **Vương** | [`destination-detail.html`](destination-detail.html) | `destination-detail.js` | `api/destinations.php` (detail), `api/reviews.php`, `api/favorites.php` | Gallery đổi ảnh tương tác, widget thời tiết, mẹo du lịch (Tips), lịch trình mẫu theo giờ, hệ thống đánh giá Review & Sao. |
| **4** | **Lập lịch trình thông minh** | **Nguyên** | [`planner.html`](planner.html) | `planner.js` | `api/ai_planner.php`, `api/trips.php` (create) | Form khảo sát chuyến đi, tạo lịch trình 100% bằng Google Gemini AI theo từng buổi (Sáng, Trưa, Chiều, Tối), thêm/xóa hoạt động tùy chỉnh, đo ngân sách. Nếu AI lỗi/mất mạng sẽ báo lỗi rõ ràng để thử lại, không tạo dữ liệu giả. |
| **5** | **Lịch trình của tôi** | **Huy** | [`itinerary.html`](itinerary.html) | `itinerary.js` | `api/trips.php` (list, delete, update_name), `api/expenses.php`, `api/checklists.php` | Quản lý chuyến đi (Xem/Sửa tên/Nhân bản/Xóa), Sổ tay theo dõi Chi tiêu thực tế (Expense Tracker), Checklist hành lý phân loại, Xuất in PDF. Trang Private, kiểm tra quyền sở hữu dữ liệu chống IDOR. |
| **6** | **Đăng nhập & Đăng ký** | **Huy, Khang** | [`login.html`](login.html), [`register.html`](register.html) | `auth.js` | `api/auth.php` (login, send_register_otp, verify_register, forgot_password, reset_password), `config/mail.php` | Form validation, Ẩn/Hiện mật khẩu, Đăng ký xác thực qua mã OTP gửi email, chống trùng email, lưu phiên bằng PHP Session. |
| **7** | **Hồ sơ cá nhân & Quản lý dữ liệu** | **Vương, Khiêm** | [`profile.html`](profile.html) | `profile.js`, `data.js` | `api/auth.php` (me, update_profile), `api/favorites.php` (list) | Cập nhật thông tin cá nhân, thống kê số chuyến đi, quản lý danh sách địa điểm đã thả tim (Favorites), gọi API lấy 30 điểm đến từ CSDL MySQL. Trang Private. |
| **8** | **Trang Quản Trị (Admin)** | **Khang** | [`admin.html`](admin.html) | `admin.js`, `admin.css` | `api/admin_stats.php`, `api/admin_users.php`, `api/destinations.php` (create, update, delete), `api/reviews.php` (delete), `config/auth_helper.php` | Phân quyền Admin/User qua PHP Session, Dashboard thống kê tổng quan, CRUD điểm đến, Khóa/Mở tài khoản vi phạm, Xóa đánh giá bậy bạ. |
| **9** | **Hạ tầng chung & Bảo mật** | **Cả nhóm** | — | — | `config/database.php`, `config/secrets.php` | Kết nối CSDL PDO dùng chung, mã hóa mật khẩu Bcrypt, chống XSS (`escapeHtml()`), chống IDOR, tách biệt API Key/mật khẩu khỏi source code. |
| **10** | **Kiểm thử & Báo cáo** | **Cả nhóm** | Toàn bộ | Toàn bộ | Toàn bộ | Kiểm thử liên kết các trang, kiểm tra Responsive Mobile/Tablet/Desktop, hoàn thiện tài liệu README. |

---

## 🗂️ 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
smart-trip-planner/
├── api/                             # Backend PHP - xử lý logic & truy vấn MySQL (PDO)
│   ├── auth.php                     # Đăng nhập / Đăng ký (OTP email) / Quên mật khẩu / Session / Cập nhật hồ sơ
│   ├── trips.php                    # CRUD Chuyến đi (có kiểm tra quyền sở hữu chống IDOR)
│   ├── expenses.php                 # Sổ chi tiêu thực tế (theo từng user đăng nhập)
│   ├── checklists.php               # Checklist hành lý (theo từng user đăng nhập)
│   ├── favorites.php                # Địa điểm yêu thích
│   ├── reviews.php                  # Đánh giá & bình luận (thêm, xóa - Admin)
│   ├── destinations.php             # Danh sách điểm đến từ CSDL + CRUD dành cho Admin
│   ├── ai_planner.php                # Gợi ý lịch trình 100% bằng Google Gemini AI
│   ├── admin_stats.php               # [Admin] Thống kê tổng quan hệ thống
│   └── admin_users.php               # [Admin] Quản lý danh sách user, khóa/mở tài khoản
├── config/
│   ├── database.php                 # Kết nối PDO tới MySQL (smart_trip_db)
│   ├── mail.php                     # Gửi email OTP qua SMTP (dùng key từ secrets.php)
│   ├── auth_helper.php               # Hàm requireAdmin()/requireLoginBackend() dùng chung cho các API
│   ├── secrets.php                  # Chứa API Key & mật khẩu email thật (KHÔNG commit lên Git)
│   └── secrets.example.php           # File mẫu an toàn, thay cho secrets.php khi đẩy code lên Git
├── database/
│   ├── smart_trip_planner.sql        # Script tạo CSDL đầy đủ + 30 điểm đến mẫu (dùng khi cài mới)
│  
├── assets/
│   ├── css/
│   │   ├── style.css                # Design System: Màu sắc, typography, cards, buttons, modals, print
│   │   ├── animation.css            # Hiệu ứng chuyển động (Fade-in, Float, Spin, Pulse)
│   │   ├── responsive.css           # Responsive Desktop, Tablet và Mobile
│   │   ├── auth.css                 # Style riêng cho trang Đăng nhập / Đăng ký
│   │   ├── home.css                 # Style riêng cho trang chủ
│   │   ├── destinations.css         # Style riêng cho trang Khám phá
│   │   ├── destination-detail.css   # Style riêng cho trang Chi tiết địa điểm
│   │   ├── planner.css              # Style riêng cho trang Lập lịch trình
│   │   ├── itinerary.css            # Style riêng cho trang Lịch trình của tôi
│   │   ├── profile.css              # Style riêng cho trang Hồ sơ cá nhân
│   │   └── admin.css                # Style riêng cho Trang Quản Trị (Admin Dashboard)
│   └── js/
│       ├── data.js                  # Lớp trung gian gọi API PHP (có fallback mock data khi mất mạng)
│       ├── main.js                  # Navbar, Sticky header, Auth state, Toast, hàm gate requireLogin/requireAdminPage
│       ├── destinations.js          # Module Khám phá (Tìm kiếm, Bộ lọc đa tiêu chí, Sắp xếp)
│       ├── destination-detail.js    # Module Chi tiết (Gallery, Đánh giá Reviews, Thời tiết)
│       ├── planner.js               # Module Smart Planner (Sinh lịch trình 100% bằng Google Gemini AI)
│       ├── itinerary.js             # Module Lịch trình (CRUD Chuyến đi, Chi tiêu thực tế, Checklist) - trang Private
│       ├── auth.js                  # Module Xác thực (Đăng nhập, Đăng ký qua OTP email)
│       ├── profile.js               # Module Hồ sơ (Cập nhật Profile, Thống kê, Quản lý Yêu thích) - trang Private
│       └── admin.js                 # Module Trang Quản Trị (Thống kê, CRUD điểm đến, Khóa user, Xóa review)
├── index.html                       # Trang chủ 
├── destinations.html                # Trang Khám phá 
├── destination-detail.html          # Trang Chi tiết địa điểm 
├── planner.html                     # Trang Smart Planner 
├── itinerary.html                   # Trang Lịch trình của tôi - Private 
├── login.html                       # Trang Đăng nhập 
├── register.html                    # Trang Đăng ký 
├── profile.html                     # Trang Hồ sơ cá nhân - Private 
├── admin.html                       # Trang Quản Trị hệ thống - chỉ dành cho role Admin 
└── README.md                        # Tài liệu kỹ thuật đồ án
```

---

## 🚀 3. HƯỚNG DẪN CHẠY & KIỂM THỬ

1. Cài **XAMPP** (hoặc Laragon), bật **Apache** và **MySQL**.
2. Copy toàn bộ thư mục `smart-trip-planner` vào `htdocs` (thư mục web root của XAMPP).
3. Mở **phpMyAdmin**, tạo CSDL bằng cách import file `database/smart_trip_planner.sql` (file này đã có đầy đủ cột `is_banned`, không cần chạy thêm gì). Nếu bạn đã có sẵn CSDL từ bản cũ trước khi có tính năng Khóa tài khoản, chỉ cần chạy thêm `database/migration_add_is_banned.sql` để thêm cột đó vào, không cần xóa dữ liệu cũ.
4. Mở file `config/database.php` và `config/mail.php`, kiểm tra lại thông tin kết nối CSDL / email SMTP cho đúng với máy của bạn.
5. Truy cập `http://localhost/smart-trip-planner/index.html` (hoặc đúng cổng Apache bạn đang cấu hình) bằng trình duyệt.

---

## 💡 4. CÁC ĐIỂM NỔI BẬT ĐỂ BÁO CÁO THẦY CÔ

1. **Giao diện đồng bộ & Chuẩn Design System:** Không dùng template dựng sẵn hay Bootstrap cũ kỹ; toàn bộ được viết bằng CSS thuần với CSS Variables hiện đại, màu sắc du lịch trẻ trung và responsive mượt mà.
2. **Gợi ý lịch trình bằng AI:** Kết nối trực tiếp Google Gemini AI để tạo lộ trình theo thời gian thực; nếu AI lỗi hoặc mất mạng, hệ thống báo lỗi minh bạch để người dùng thử lại chứ không tự tạo dữ liệu giả.
3. **Backend PHP + MySQL thật:** Xác thực đăng ký qua mã OTP gửi email, mật khẩu mã hóa Bcrypt, dữ liệu Chuyến đi/Chi tiêu/Checklist/Yêu thích lưu trực tiếp vào CSDL theo từng tài khoản.
4. **Đầy đủ tính năng thực tế:** Sổ quản lý chi tiêu (Expense Tracker) + Checklist hành lý có thanh tiến độ `%` + Hệ thống Đánh giá Review + Gợi ý lịch trình bằng AI (Google Gemini).
5. **Phân quyền & Bảo mật:** Phân quyền Public/Private theo trang (khách xem tự do, phải đăng nhập mới vào được "Lịch trình của tôi") và phân quyền theo vai trò Admin/User qua PHP Session (không phải chỉ ẩn nút ở giao diện). Chống XSS khi hiển thị nội dung người dùng nhập, chống thao túng dữ liệu người khác (kiểm tra quyền sở hữu ở mọi API sửa/xóa).

## 5. Dữ liệu API KEY
** Thông tin gửi mail OTP qua Gmail SMTP **
Hướng dẫn lấy App Password: https://myaccount.google.com/apppasswords
define('SMTP_EMAIL', 'your_email@gmail.com');
define('SMTP_APP_PASSWORD', 'your_16_char_app_password');

** API Key Google Gemini AI **
Lấy key tại: https://aistudio.google.com/app/apikey
define('GEMINI_API_KEY', 'your_gemini_api_key');


