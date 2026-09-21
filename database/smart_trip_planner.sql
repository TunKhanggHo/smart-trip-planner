-- ================================================
-- CƠ SỞ DỮ LIỆU: MySQL / MariaDB (smart_trip_db)
-- ================================================

CREATE DATABASE IF NOT EXISTS `smart_trip_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_trip_db`;

-- 1. BẢNG NGƯỜI DÙNG (users)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT 'default_avatar.png',
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `is_banned` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG DANH MỤC PHÂN LOẠI (categories)
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) DEFAULT '✨'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG ĐIỂM ĐẾN DU LỊCH (destinations)
DROP TABLE IF EXISTS `destinations`;
CREATE TABLE `destinations` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL,
  `badge` VARCHAR(50) DEFAULT 'Nổi bật',
  `image` VARCHAR(500) NOT NULL,
  `rating` DECIMAL(3,2) DEFAULT 5.00,
  `review_count` INT DEFAULT 0,
  `avg_cost_per_day` INT NOT NULL,
  `cost_level` VARCHAR(50) DEFAULT 'Vừa phải',
  `ideal_days` VARCHAR(50) DEFAULT '3 ngày 2 đêm',
  `best_time` VARCHAR(150) DEFAULT NULL,
  `weather_temp` VARCHAR(20) DEFAULT '25°C',
  `weather_desc` VARCHAR(100) DEFAULT 'Trời nắng đẹp',
  `weather_icon` VARCHAR(10) DEFAULT '☀️',
  `weather_humidity` VARCHAR(20) DEFAULT '70%',
  `description` TEXT NOT NULL,
  `tips` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG HOẠT ĐỘNG MẪU THEO GIỜ CỦA ĐIỂM ĐẾN (destination_activities)
DROP TABLE IF EXISTS `destination_activities`;
CREATE TABLE `destination_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `destination_id` VARCHAR(50) NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `cost` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG CHUYẾN ĐI (trips)
DROP TABLE IF EXISTS `trips`;
CREATE TABLE `trips` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `destination_id` VARCHAR(50) NOT NULL,
  `destination_name` VARCHAR(200) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `days` INT NOT NULL DEFAULT 3,
  `people` INT NOT NULL DEFAULT 2,
  `vehicle` VARCHAR(50) DEFAULT 'xe máy',
  `style` VARCHAR(50) DEFAULT 'chill',
  `user_budget` INT NOT NULL DEFAULT 0,
  `total_cost_per_person` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG LỊCH TRÌNH CHI TIẾT TỪNG NGÀY CỦA CHUYẾN ĐI (trip_schedules)
DROP TABLE IF EXISTS `trip_schedules`;
CREATE TABLE `trip_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trip_id` VARCHAR(100) NOT NULL,
  `day_number` INT NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `cost` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG SỔ CHI TIÊU THỰC TẾ (trip_expenses)
DROP TABLE IF EXISTS `trip_expenses`;
CREATE TABLE `trip_expenses` (
  `id` VARCHAR(100) PRIMARY KEY,
  `trip_id` VARCHAR(100) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `amount` INT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `expense_date` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG CHECKLIST HÀNH LÝ (trip_checklists)
DROP TABLE IF EXISTS `trip_checklists`;
CREATE TABLE `trip_checklists` (
  `id` VARCHAR(100) PRIMARY KEY,
  `trip_id` VARCHAR(100) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `is_checked` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG ĐỊA ĐIỂM YÊU THÍCH (favorites)
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `destination_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_fav` (`user_id`, `destination_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG ĐÁNH GIÁ & BÌNH LUẬN (reviews)
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `destination_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `date_posted` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DỮ LIỆU MẪU KHỞI TẠO (SEED DATA)
-- ==============================================================================

-- Tài khoản mẫu:
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `bio`, `role`) VALUES
(1, 'Khang (Trưởng nhóm)', 'khang@gmail.com', '$2b$10$6ogWF7EBUGfSMYQS58GQdea2OpE6Dis2MwfAeHAozlmilcPIWlLNC', '0901234567', 'Đam mê xê dịch và khám phá những cung đường phượt Việt Nam.', 'admin'),
(2, 'Nguyễn Văn Demo', 'demo@gmail.com', '$2b$10$yvngDBSMFar8yHQnHr3s6uQej5s23K.lrHnPzYWXy8mAZsx6Oe12m', '0912345678', 'Thích đi du lịch khám phá và ăn uống.', 'user');
-- Mật khẩu tài khoản khang@gmail.com (admin): Admin@123
-- Mật khẩu tài khoản demo@gmail.com (user thường): User@123

-- Danh mục phân loại
INSERT INTO `categories` (`id`, `code`, `name`, `icon`) VALUES
(1, 'chill', 'Nghỉ dưỡng / Chill', '☕'),
(2, 'adventure', 'Khám phá / Phượt', '🏍️'),
(3, 'beach', 'Biển đảo', '🏖️'),
(4, 'nature', 'Thiên nhiên / Núi', '⛰️'),
(5, 'city', 'Văn hóa / Đô thị', '🏮');

-- 30 ĐIỂM ĐẾN DU LỊCH TRẢI DÀI KHẮP 3 MIỀN VIỆT NAM
INSERT INTO `destinations` (`id`, `name`, `city`, `category_id`, `badge`, `image`, `rating`, `review_count`, `avg_cost_per_day`, `cost_level`, `ideal_days`, `best_time`, `weather_temp`, `weather_desc`, `weather_icon`, `weather_humidity`, `description`, `tips`) VALUES
-- Miền Bắc
('dalat', 'Đà Lạt - Thành Phố Mộng Mơ', 'Lâm Đồng', 1, 'Yêu thích nhất', 'https://cdn3.ivivu.com/2023/10/du-lich-Da-Lat-ivivu.jpg', 4.90, 342, 750000, 'Tiết kiệm', '3 ngày 2 đêm', 'Tháng 10 - Tháng 4', '18°C', 'Se lạnh, có nắng nhẹ', '⛅', '75%', 'Trốn khỏi khói bụi thành phố để tận hưởng không khí se lạnh, những đồi thông xanh ngát, quán cà phê ngắm hoàng hôn.', 'Nên chuẩn bị áo ấm vì nhiệt độ buổi tối xuống thấp tầm 14-16°C. Thuê xe máy số để leo dốc an toàn.'),
('hagiang', 'Hà Giang - Chinh Phục Cực Bắc', 'Hà Giang', 2, 'Hùng vĩ', 'https://dulich3mien.vn/wp-content/uploads/2023/01/Cot-co-Lung-Cu-1.jpg', 4.95, 280, 900000, 'Vừa phải', '3 ngày 2 đêm', 'Tháng 9 - Tháng 12', '21°C', 'Trời quang mây tạnh', '🌤️', '65%', 'Cung đường phượt huyền thoại với hẻm vực kỳ vĩ, đèo Mã Pí Lèng hiểm trở, dòng sông Nho Quế xanh ngọc bích.', 'Kiểm tra phanh xe máy trước khi đổ đèo. Mang CCCD làm thủ tục cột cờ Lũng Cú.'),
('sapa', 'Sa Pa - Xứ Sở Sương Mù & Fansipan', 'Lào Cai', 1, 'Săn mây', 'https://cdn.ohanapreschool.edu.vn/wp-content/uploads/2025/12/lang-le-sa-pa-sang-tac-nam-nao-1.jpg', 4.88, 310, 800000, 'Vừa phải', '3 ngày 2 đêm', 'Tháng 9 - Tháng 11', '15°C', 'Sương mù nhẹ, se lạnh', '🌫️', '82%', 'Thị trấn trong mây với đỉnh Fansipan - Nóc nhà Đông Dương và ruộng bậc thang đẹp như tranh.', 'Đi cáp treo Fansipan buổi sáng để có tầm nhìn trong trẻo nhất.'),
('ninhbinh', 'Ninh Bình - Vịnh Hạ Long Trên Cạn', 'Ninh Bình', 4, 'Di sản UNESCO', 'https://amazingourworld.com/wp-content/uploads/2020/05/Tour-Ninh-Binh-Ha-Lonh-.jpg', 4.90, 198, 650000, 'Tiết kiệm', '2 ngày 1 đêm', 'Tháng 1 - Tháng 6', '24°C', 'Thời tiết mát mẻ', '🌤️', '78%', 'Chèo thuyền xuyên hang động kỳ bí Tràng An, ngắm toàn cảnh thung lũng Tam Cốc từ Hang Múa.', 'Mang theo mũ nón khi đi thuyền Tràng An vì chặng thuyền kéo dài 2.5 - 3 tiếng ngoài trời.'),
('halong', 'Hạ Long - Kỳ Quan Thiên Nhiên Thế Giới', 'Quảng Ninh', 4, 'Kỳ quan thế giới', 'https://storage.attractionsvietnam.com/images/m-1/lqCwfs9pkW2I5wib.jpg?w=1200&fm=webp&q=80', 4.93, 620, 1100000, 'Cao cấp', '2 ngày 1 đêm', 'Tháng 4 - Tháng 10', '27°C', 'Trời trong xanh', '☀️', '76%', 'Du ngoạn giữa hàng ngàn đảo đá vôi kỳ vĩ nhô lên từ làn nước xanh ngọc bích.', 'Trải nghiệm ngủ đêm trên du thuyền ngắm bình minh trên vịnh.'),
('taxua', 'Tà Xùa - Thiên Đường Săn Mây Vùng Tây Bắc', 'Sơn La', 2, 'Cực hot', 'https://dulichtaxua.com.vn/wp-content/uploads/2022/11/le-huynh-1-16640686508761668459475-1536x1024.jpeg', 4.94, 295, 720000, 'Tiết kiệm', '2 ngày 1 đêm', 'Tháng 11 - Tháng 4', '16°C', 'Biển mây bồng bềnh', '☁️', '85%', 'Biển mây trắng muốt cuồn cuộn dưới chân, sống lưng khủng long Háng Đồng và mỏm cá heo cheo leo.', 'Đường lên có nhiều đoạn cua dốc, cần chắc tay lái xe máy.'),
('mocchau', 'Mộc Châu - Cao Nguyên Xanh & Mùa Hoa Mận', 'Sơn La', 4, 'Thơ mộng', 'https://media-cdn-v2.laodong.vn/storage/newsportal/2025/2/11/1461380/Vuon_Hoa_Man-03.jpg', 4.85, 210, 650000, 'Tiết kiệm', '2 ngày 1 đêm', 'Tháng 1 - Tháng 2', '20°C', 'Mát mẻ dễ chịu', '🌤️', '70%', 'Đồi chè xanh mướt uốn lượn hình trái tim và thung lũng mận Nà Ka nở hoa trắng muốt ngút ngàn.', 'Đi vào tháng 1-2 để chụp ảnh hoa mận nở đẹp nhất.'),
('caobang', 'Cao Bằng - Thác Bản Giốc Hùng Vĩ', 'Cao Bằng', 4, 'Kỳ vĩ', 'https://thienthanhlimousine.com/wp-content/uploads/2025/12/Canh-nui-rung-Cao-Bang-hien-ra-hung-vi-suot-doc-tuyen-duong-di-Ban-Gioc.jpg', 4.91, 170, 750000, 'Tiết kiệm', '3 ngày 2 đêm', 'Tháng 8 - Tháng 11', '22°C', 'Mát mẻ vùng cao', '⛰️', '76%', 'Thác nước tự nhiên lớn nhất Đông Nam Á tuôn trào trắng xóa và dòng suối Lê-Nin xanh ngọc bích.', 'Thuê thuyền nan đi sát chân Thác Bản Giốc để chụp ảnh đẹp.'),
('hanoi', 'Hà Nội - Thủ Đô 36 Phố Phường', 'Hà Nội', 5, 'Văn hiến', 'https://nguoikesu.com/images/wiki/ho-hoan-kiem/1cb42f288faf93b63e65aa01d3d4629d.jpg', 4.88, 520, 700000, 'Tiết kiệm', '2 ngày 1 đêm', 'Quanh năm', '26°C', 'Thời tiết dễ chịu', '🌤️', '70%', 'Dạo Hồ Hoàn Kiếm, ngắm phố cổ rêu phong, thưởng thức phở bò Bát Đàn, bún chả và cà phê trứng.', 'Dạo phố đi bộ Hồ Gươm vào tối cuối tuần.'),
('maichau', 'Mai Châu - Bản Lát Yên Bình', 'Hòa Bình', 1, 'Bình yên', 'https://bizweb.dktcdn.net/100/072/558/files/ban-lac-mai-chau-1.jpg?v=1573550153255', 4.82, 160, 600000, 'Rất tiết kiệm', '2 ngày 1 đêm', 'Tháng 10 - Tháng 4', '23°C', 'Trong lành', '🌲', '75%', 'Đạp xe ngắm những cánh đồng lúa xanh ngút ngàn tại Bản Lác, trải nghiệm ngủ nhà sàn người Thái.', 'Thử trải nghiệm múa sạp và uống rượu cần.'),
('coto', 'Đảo Cô Tô - Thiên Đường Biển Đảo', 'Quảng Ninh', 3, 'Nước trong vắt', 'https://cdn-petrotimes.mastercms.vn/stores/news_dataimages/2023/112023/26/19/co-to-thien-duong-cua-nhung-hon-dao-dep-20231126191456.jpg?rt=20231126191544', 4.86, 190, 850000, 'Vừa phải', '3 ngày 2 đêm', 'Tháng 4 - Tháng 9', '28°C', 'Nắng vàng biển êm', '🏖️', '72%', 'Bãi biển Vàn Chảy, Hồng Vàn hoang sơ với bãi cát dài trắng mịn, bãi đá Cầu Mỵ sóng vỗ rì rào.', 'Đi cano sang đảo Cô Tô Con ngắm biển trong vắt.'),
('catba', 'Cát Bà - Vịnh Lan Hạ & Vườn Quốc Gia', 'Hải Phòng', 4, 'Xanh mướt', 'https://www.tauhalong.vn/wp-content/uploads/2024/08/di-san-dia-chat-vinh-ha-long.jpg', 4.87, 275, 800000, 'Vừa phải', '2 ngày 1 đêm', 'Tháng 4 - Tháng 10', '27°C', 'Biển lặng gió mát', '⛵', '74%', 'Chèo thuyền Kayak khám phá Vịnh Lan Hạ trong xanh, thám hiểm Vườn quốc gia Cát Bà.', 'Ăn bánh đa cua bể Hải Phòng.'),
('tamdao', 'Tam Đảo - Thị Trấn Bồng Bềnh Trong Mây', 'Vĩnh Phúc', 1, 'Gần Hà Nội', 'https://baogiaothong.mediacdn.vn/stores/news_dataimages/thuylinh/082019/17/23/230914baoxaydung_anh3.jpg', 4.79, 310, 680000, 'Tiết kiệm', '2 ngày 1 đêm', 'Quanh năm', '20°C', 'Se lạnh mát mẻ', '☁️', '80%', 'Được ví như Đà Lạt miền Bắc với thời tiết 4 mùa trong 1 ngày, Cổng Trời Tam Đảo, Cầu Mây.', 'Ăn ngọn su su xào tỏi giòn ngọt.'),

-- Miền Trung & Tây Nguyên
('danang', 'Đà Nẵng & Hội An - Hành Trình Di Sản', 'Đà Nẵng / Quảng Nam', 5, 'Đáng sống nhất', 'https://hoangphuan.com/wp-content/uploads/2024/05/thanh0310-230322020312-du-lich-hoi-an-ve-dem-04.jpg', 4.92, 460, 850000, 'Vừa phải', '3 ngày 2 đêm', 'Tháng 2 - Tháng 8', '28°C', 'Nắng ráo, biển êm', '☀️', '68%', 'Biển Mỹ Khê cát trắng, Cầu Vàng Bà Nà Hills và vẻ đẹp lung linh đèn lồng của Phố cổ Hội An.', 'Cầu Rồng phun lửa lúc 21h00 thứ Bảy và Chủ Nhật.'),
('hue', 'Huế - Cố Đô Trầm Mặc & Ẩm Thực', 'Thừa Thiên Huế', 5, 'Di sản', 'https://image.vialala.com/width=1792,ratio=1.46,type=webp/2026/02/que-faire-a-hue-6984c3e3c7c38.jpeg', 4.86, 220, 600000, 'Rất tiết kiệm', '2 ngày 1 đêm', 'Tháng 1 - Tháng 4', '25°C', 'Nắng nhẹ êm dịu', '🌤️', '72%', 'Đại Nội Hoàng Cung uy nghiêm, nghe ca Huế trên sông Hương và thưởng thức Bún bò Huế gốc.', 'Thuê áo dài hoặc cổ phục chụp ảnh tại Đại Nội.'),
('quynhon', 'Quy Nhơn - Eo Gió & Kỳ Co Trong Vắt', 'Bình Định', 3, 'Mới nổi', 'https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-trung/quy-nhon/danh-thang/ky-co-eo-gio-2.jpg', 4.82, 165, 700000, 'Tiết kiệm', '3 ngày 2 đêm', 'Tháng 3 - Tháng 9', '30°C', 'Nắng rực rỡ, gió lộng', '☀️', '65%', 'Bãi biển Kỳ Co 2 màu nước xanh ngọc thấu đáy, con đường ven biển Eo Gió hùng vĩ.', 'Đi cano ra Kỳ Co sáng sớm để nước trong nhất.'),
('nhatrang', 'Nha Trang - Vịnh Biển Nắng Vàng', 'Khánh Hòa', 3, 'Sôi động', 'https://cotrang.org/dia-diem/images/nha-trang/dia-diem/thap-tram-huong/thap-tram-huong-nha-trang-bk-002.jpg', 4.87, 540, 950000, 'Vừa phải', '3 ngày 2 đêm', 'Tháng 1 - Tháng 9', '30°C', 'Nắng vàng, sóng êm', '☀️', '66%', 'Lặn biển ngắm san hô tại Hòn Mun, vui chơi VinWonders Hòn Tre và tắm bùn khoáng nóng.', 'Nên đi tour đảo bằng cano cao tốc.'),
('phuyen', 'Phú Yên - Xứ Sở Hoa Vàng Cỏ Xanh', 'Phú Yên', 4, 'Nguyên sơ', 'https://tropicaltrip.vn/wp-content/uploads/2025/09/Shutterstock_2239799547-2048x1154.jpg', 4.89, 230, 650000, 'Tiết kiệm', '3 ngày 2 đêm', 'Tháng 1 - Tháng 8', '29°C', 'Trời trong nắng ấm', '🌤️', '68%', 'Ghềnh Đá Đĩa độc nhất vô nhị, Bãi Xép khung cảnh phim và đón bình minh đầu tiên tại Mũi Điện.', 'Ăn mắt cá ngừ đại dương hầm thuốc bắc.'),
('quangbinh', 'Quảng Bình - Vương Quốc Hang Động', 'Quảng Bình', 2, 'Đỉnh cao thám hiểm', 'https://quangbinhtravel.vn/wp-content/uploads/2024/09/hang-kieu.jpg', 4.96, 380, 1100000, 'Cao cấp', '3 ngày 2 đêm', 'Tháng 4 - Tháng 8', '28°C', 'Mát mẻ trong hang', '⛰️', '70%', 'Kỳ quan Động Phong Nha, Động Thiên Đường tráng lệ, đu dây Zipline Sông Chày - Hang Tối.', 'Mang theo túi chống nước cho điện thoại.'),
('mangden', 'Măng Đen - Nàng Thơ Đại Ngàn', 'Kon Tum', 1, 'Chữa lành', 'https://vpsglobal.vn/travel/wp-content/uploads/2026/05/PKMD3.jpg', 4.89, 145, 680000, 'Tiết kiệm', '3 ngày 2 đêm', 'Tháng 10 - Tháng 3', '19°C', 'Trong lành, se lạnh', '🌲', '78%', 'Đà Lạt thứ hai của Tây Nguyên với rừng thông bạt ngàn, thác Pa Sỹ hoang sơ, hồ Đắk Ke.', 'Thức dậy sớm tầm 5h30 để đi săn sương.'),
('buonmathuot', 'Buôn Ma Thuột - Thủ Phủ Cà Phê', 'Đắk Lắk', 5, 'Đậm đà', 'https://vlstudies.com/wp-content/uploads/2024/06/Buon-Ma-Thuot.jpg', 4.84, 205, 680000, 'Tiết kiệm', '2 ngày 1 đêm', 'Tháng 12 - Tháng 4', '27°C', 'Gió lộng đại ngàn', '☕', '65%', 'Bảo tàng Thế giới Cà phê kiến trúc độc đáo, cụm thác Dray Nur hùng vĩ và Hồ Lắk.', 'Uống cà phê chồn nguyên chất.'),
('phanthiet', 'Phan Thiết & Mũi Né - Đồi Cát Bay', 'Bình Thuận', 2, 'Trải nghiệm đỉnh', 'https://vietrektravel.com/Upload/News/Huong-Dan-Chi-Tiet-Duong-Di-Doi-Cat-Bay-Mui-Ne-Phan-Thiet.jpg', 4.83, 310, 780000, 'Vừa phải', '2 ngày 1 đêm', 'Tháng 11 - Tháng 4', '31°C', 'Nắng rực rỡ', '☀️', '62%', 'Lái xe Jeep địa hình trên những đồi cát trắng Bàu Trắng, lội suối Tiên đỏ rực.', 'Đi tour xe Jeep lúc 5h00 sáng đón bình minh.'),
('ninhthuan', 'Ninh Thuận - Vịnh Vĩnh Hy & Vườn Nho', 'Ninh Thuận', 4, 'Nắng gió kỳ thú', 'https://i.ytimg.com/vi/6gyslkmoyWY/maxresdefault.jpg', 4.85, 180, 700000, 'Tiết kiệm', '2 ngày 1 đêm', 'Tháng 1 - Tháng 8', '30°C', 'Nắng ráo biển xanh', '🍇', '66%', 'Vịnh Vĩnh Hy xanh biếc lọt thỏm giữa núi rừng, Hang Rái kỳ ảo và vườn nho Ba Mọi.', 'Thử rượu nho và táo xanh Ninh Thuận.'),

-- Miền Nam & Biển Đảo
('phuquoc', 'Phú Quốc - Thiên Đường Đảo Ngọc', 'Kiên Giang', 3, 'Hot Trend', 'https://eaglegroup.com.vn/wp-content/uploads/2023/06/den-phu-quoc.jpeg', 4.85, 512, 1200000, 'Cao cấp', '3 ngày 2 đêm', 'Tháng 11 - Tháng 4', '29°C', 'Nắng vàng, gió biển mát', '☀️', '70%', 'Nước biển trong vắt như gương, ngắm hoàng hôn đỏ rực Sunset Sanato và ăn Bún Quậy.', 'Đặt vé máy bay sớm vào mùa khô.'),
('condao', 'Côn Đảo - Vẻ Đẹp Hoang Sơ & Biển Xanh', 'Bà Rịa - Vũng Tàu', 3, 'Hoang sơ', 'https://scootersaigontour.com/wp-content/uploads/2023/02/Con-Dao-Top-10-most-beautiful-islands-in-Vietnam.jpg', 4.96, 185, 1300000, 'Cao cấp', '3 ngày 2 đêm', 'Tháng 3 - Tháng 9', '28°C', 'Nước biển trong vắt', '🏖️', '74%', 'Nước biển xanh thấu đáy, Bãi Đầm Trầu ngắm máy bay hạ cánh sát đầu và Nghĩa trang Hàng Dương.', 'Mặc trang phục lịch sự khi viếng nghĩa trang.'),
('vungtau', 'Vũng Tàu - Đi Trốn Cuối Tuần', 'Bà Rịa - Vũng Tàu', 1, 'Gần TP.HCM', 'https://mia.vn/media/uploads/blog-du-lich/tuong-chua-kito-vung-tau-tuong-chua-jesus-lon-nhat-chau-a-06-1633683878.jpg', 4.80, 380, 600000, 'Rất tiết kiệm', '2 ngày 1 đêm', 'Quanh năm', '29°C', 'Nắng gió biển mát', '🌤️', '73%', 'Điểm đi trốn số 1 của giới trẻ Sài Gòn, ngắm hoàng hôn Mũi Nghinh Phong và ăn bánh khọt.', 'Chạy xe dọc đường biển lúc 17h00 ngắm hoàng hôn.'),
('cantho', 'Cần Thơ - Sông Nước & Chợ Nổi Cái Răng', 'Cần Thơ', 5, 'Đặc sắc', 'https://mia.vn/media/uploads/blog-du-lich/kham-pha-cho-noi-cai-rang-net-dac-sac-cua-rieng-mien-tay-song-nuoc-01-1663048025.jpg', 4.84, 230, 580000, 'Rất tiết kiệm', '2 ngày 1 đêm', 'Tháng 5 - Tháng 8', '29°C', 'Gió sông mát rượi', '🌤️', '79%', 'Chợ nổi Cái Răng tấp nập thuyền bè sáng sớm, Bến Ninh Kiều lung linh và miệt vườn cây trái.', 'Chợ nổi họp đông nhất từ 5h30 - 7h00 sáng.'),
('tayninh', 'Tây Ninh - Nóc Nhà Nam Bộ Núi Bà Đen', 'Tây Ninh', 2, 'Nóc nhà Nam Bộ', 'https://bizweb.dktcdn.net/100/052/508/files/su-tich-nui-ba-den.jpg?v=1765902358358', 4.87, 290, 620000, 'Tiết kiệm', '2 ngày 1 đêm', 'Quanh năm', '28°C', 'Nắng ráo mát mẻ trên đỉnh', '⛰️', '70%', 'Chinh phục đỉnh Núi Bà Đen 986m ngắm biển mây, chiêm bái Tượng Phật Bà và Tòa Thánh Tây Ninh.', 'Thưởng thức bánh tráng phơi sương Trảng Bàng.'),
('angiang', 'An Giang - Rừng Tràm Trà Sư & Châu Đốc', 'An Giang', 4, 'Mùa nước nổi', 'https://media.loveitopcdn.com/40838/rung-tram-tra-su-an-giang-mua-nuoc-noi.jpg', 4.86, 240, 600000, 'Rất tiết kiệm', '2 ngày 1 đêm', 'Tháng 9 - Tháng 11', '28°C', 'Sông nước thanh bình', '🚣', '78%', 'Ngồi xuồng lướt trên thảm bèo cám xanh mướt Rừng tràm Trà Sư, viếng Miếu Bà Chúa Xứ Núi Sam.', 'Ăn lẩu cá linh bông điên điển mùa nước nổi.'),
('saigon', 'TP. Hồ Chí Minh - Sài Gòn Sôi Động', 'Hồ Chí Minh', 5, 'Không ngủ', 'https://kichcaudulichtphcm.vn/wp-content/uploads/2024/10/dia-diem-vui-choi-sai-gon-ve-dem-04.jpg', 4.90, 780, 750000, 'Tiết kiệm', '2 ngày 1 đêm', 'Quanh năm', '30°C', 'Nắng ấm nhộn nhịp', '🌆', '72%', 'Dạo Phố đi bộ Nguyễn Huệ, ngắm Landmark 81, đi xe buýt 2 tầng và food tour Chợ Bến Thành.', 'Uống cà phê bệt Nhà thờ Đức Bà.');

-- Hoạt động mẫu Đà Lạt
INSERT INTO `destination_activities` (`destination_id`, `time_slot`, `title`, `cost`) VALUES
('dalat', 'Sáng (06:00 - 09:00)', 'Săn mây Cầu Đất & Uống cà phê đón bình minh', 120000),
('dalat', 'Trưa (11:30 - 13:30)', 'Ăn lẩu gà lá é Tao Ngộ & Thưởng trà Atiso', 150000),
('dalat', 'Chiều (14:30 - 17:30)', 'Tham quan Vườn hoa Cẩm tú cầu / Đồi thông', 80000),
('dalat', 'Tối (18:30 - 22:00)', 'Dạo Chợ Đêm Đà Lạt & Bánh tráng nướng, sữa đậu nành', 100000);
