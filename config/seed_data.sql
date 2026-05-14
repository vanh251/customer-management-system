-- ============================================================
-- SEED DATA cho vietanh_store
-- Chạy file này SAU KHI đã chạy database.sql
-- ============================================================

USE vietanh_store;

-- ============================================================
-- 1. USERS - Dữ liệu mẫu
-- ============================================================
-- Mật khẩu ADMIN: "password" → $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Mật khẩu USER:  "password" → $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================
INSERT INTO users (full_name, email, phone, password, avatar_url, address, role) VALUES
-- ADMIN (id = 1, 2)
('Admin Việt Anh',  'admin@vietanh.com',      '0901234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'Hà Nội',       'ADMIN'),
('Admin Ngọc Anh',  'ngocanhad@vietanh.com',   '0912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'Hồ Chí Minh',  'ADMIN'),

-- USER (id = 3 → 11)
('Nguyễn Thị Mai',  'mai.nguyen@email.com',    '0987654321', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '123 Nguyễn Huệ, Q.1, TP.HCM',          'USER'),
('Trần Văn Hùng',   'hung.tran@email.com',     '0976543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '456 Lê Lợi, Q.3, TP.HCM',              'USER'),
('Lê Minh Ngọc',    'ngoc.le@email.com',       '0965432109', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '789 Trần Hưng Đạo, Q.5, TP.HCM',       'USER'),
('Phạm Quang Đạt',  'dat.pham@email.com',      '0954321098', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '12 Hai Bà Trưng, Hoàn Kiếm, Hà Nội',   'USER'),
('Hoàng Thị Lan',   'lan.hoang@email.com',     '0943210987', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '34 Nguyễn Trãi, Thanh Xuân, Hà Nội',   'USER'),
('Vũ Đức Anh',      'anh.vu@email.com',        '0932109876', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '56 Bạch Đằng, Hải Châu, Đà Nẵng',     'USER'),
('Đỗ Thanh Tùng',   'tung.do@email.com',       '0921098765', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '78 Lý Thường Kiệt, TP Huế',            'USER'),
('Bùi Hồng Nhung',  'nhung.bui@email.com',     '0910987654', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '90 Trần Phú, Nha Trang',               'USER'),
('Ngô Minh Khoa',   'khoa.ngo@email.com',      '0909876543', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '23 Phan Đình Phùng, Cần Thơ',          'USER'),

-- STAFF (id = 12, 13)
('NV Minh Tuấn', 'tuan.staff@vietanh.com', '0901111111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'Hà Nội', 'STAFF'),
('NV Thu Hà',    'ha.staff@vietanh.com',   '0902222222', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'TP.HCM', 'STAFF');

-- Gán nhân viên phụ trách cho khách hàng mẫu bằng biến SQL
SET @tuan_id = (SELECT id FROM users WHERE email = 'tuan.staff@vietanh.com' LIMIT 1);
SET @ha_id = (SELECT id FROM users WHERE email = 'ha.staff@vietanh.com' LIMIT 1);

UPDATE users SET assigned_staff_id = @tuan_id WHERE id IN (3, 4, 5, 6);
UPDATE users SET assigned_staff_id = @ha_id WHERE id IN (7, 8, 9, 10, 11);

-- Gán hạng KH mẫu
UPDATE users SET customer_tier = 'DIAMOND', tier_discount = 15.00, tags = 'VIP,Khách quen' WHERE id = 3;
UPDATE users SET customer_tier = 'PLATINUM', tier_discount = 10.00, tags = 'VIP' WHERE id = 4;
UPDATE users SET customer_tier = 'GOLD', tier_discount = 7.00, tags = 'Tiềm năng' WHERE id = 5;
UPDATE users SET customer_tier = 'SILVER', tier_discount = 3.00 WHERE id IN (6, 7);

-- ============================================================
-- 2. PRODUCTS - 10 sản phẩm
-- ============================================================
INSERT INTO products (name, price, old_price, stock_quantity, image_url, description, category, status) VALUES
('iPhone 15 Pro Max 256GB',   34990000.00, 38990000.00,  50, 'https://placehold.co/400x400?text=iPhone+15',      'Điện thoại Apple iPhone 15 Pro Max 256GB chính hãng', 'Điện thoại', 'ACTIVE'),
('Samsung Galaxy S24 Ultra',  31990000.00, 33990000.00,  35, 'https://placehold.co/400x400?text=Galaxy+S24',      'Samsung Galaxy S24 Ultra 12GB/256GB', 'Điện thoại', 'ACTIVE'),
('MacBook Air M3 2024',       27990000.00, 32990000.00,  20, 'https://placehold.co/400x400?text=MacBook+Air',     'MacBook Air 13 inch M3 chip 8GB/256GB', 'Laptop', 'ACTIVE'),
('iPad Pro M4 11 inch',       28990000.00, NULL,          25, 'https://placehold.co/400x400?text=iPad+Pro',        'iPad Pro M4 11 inch WiFi 256GB', 'Tablet', 'ACTIVE'),
('AirPods Pro 2',              5990000.00,  6990000.00, 100, 'https://placehold.co/400x400?text=AirPods',         'Apple AirPods Pro thế hệ 2 USB-C', 'Phụ kiện', 'ACTIVE'),
('Apple Watch Series 9',      10990000.00, 12990000.00,  40, 'https://placehold.co/400x400?text=Apple+Watch',     'Apple Watch Series 9 GPS 45mm', 'Phụ kiện', 'ACTIVE'),
('Sony WH-1000XM5',            7490000.00,  8990000.00,  30, 'https://placehold.co/400x400?text=Sony+XM5',        'Tai nghe chống ồn Sony WH-1000XM5', 'Phụ kiện', 'ACTIVE'),
('Dell XPS 15 2024',          42990000.00, NULL,          15, 'https://placehold.co/400x400?text=Dell+XPS',        'Dell XPS 15 Intel Core Ultra 7, 16GB/512GB', 'Laptop', 'ACTIVE'),
('Logitech MX Master 3S',     2490000.00,  2990000.00,  80, 'https://placehold.co/400x400?text=MX+Master',       'Chuột không dây Logitech MX Master 3S', 'Phụ kiện', 'ACTIVE'),
('Samsung Monitor 32 4K',     8990000.00, 10990000.00,  25, 'https://placehold.co/400x400?text=Samsung+Monitor', 'Màn hình Samsung ViewFinity S8 32 inch 4K UHD', 'Màn hình', 'ACTIVE');

-- ============================================================
-- 3. ORDERS - 22 đơn hàng
-- user_id: 3-11 (9 khách hàng USER)
-- ============================================================
INSERT INTO orders (user_id, total_amount, status, shipping_address, shipping_phone) VALUES
-- Nguyễn Thị Mai (id=3) - 5 đơn
(3,  34990000.00, 'DELIVERED',  '123 Nguyễn Huệ, Q.1, TP.HCM',         '0987654321'),
(3,  31990000.00, 'DELIVERED',  '123 Nguyễn Huệ, Q.1, TP.HCM',         '0987654321'),
(3,  28990000.00, 'DELIVERED',  '123 Nguyễn Huệ, Q.1, TP.HCM',         '0987654321'),
(3,  10990000.00, 'DELIVERED',  '123 Nguyễn Huệ, Q.1, TP.HCM',         '0987654321'),
(3,   5990000.00, 'SHIPPED',   '123 Nguyễn Huệ, Q.1, TP.HCM',         '0987654321'),

-- Trần Văn Hùng (id=4) - 4 đơn
(4,  34990000.00, 'DELIVERED',  '456 Lê Lợi, Q.3, TP.HCM',             '0976543210'),
(4,  27990000.00, 'DELIVERED',  '456 Lê Lợi, Q.3, TP.HCM',             '0976543210'),
(4,   7490000.00, 'DELIVERED',  '456 Lê Lợi, Q.3, TP.HCM',             '0976543210'),
(4,   2490000.00, 'PROCESSING', '456 Lê Lợi, Q.3, TP.HCM',             '0976543210'),

-- Lê Minh Ngọc (id=5) - 3 đơn
(5,  42990000.00, 'DELIVERED',  '789 Trần Hưng Đạo, Q.5, TP.HCM',      '0965432109'),
(5,  31990000.00, 'DELIVERED',  '789 Trần Hưng Đạo, Q.5, TP.HCM',      '0965432109'),
(5,   8990000.00, 'SHIPPED',   '789 Trần Hưng Đạo, Q.5, TP.HCM',      '0965432109'),

-- Phạm Quang Đạt (id=6) - 2 đơn
(6,  34990000.00, 'DELIVERED',  '12 Hai Bà Trưng, Hoàn Kiếm, Hà Nội',  '0954321098'),
(6,   5990000.00, 'DELIVERED',  '12 Hai Bà Trưng, Hoàn Kiếm, Hà Nội',  '0954321098'),

-- Hoàng Thị Lan (id=7) - 2 đơn
(7,  27990000.00, 'DELIVERED',  '34 Nguyễn Trãi, Thanh Xuân, Hà Nội',  '0943210987'),
(7,  10990000.00, 'PENDING',   '34 Nguyễn Trãi, Thanh Xuân, Hà Nội',  '0943210987'),

-- Vũ Đức Anh (id=8) - 2 đơn
(8,  31990000.00, 'DELIVERED',  '56 Bạch Đằng, Hải Châu, Đà Nẵng',    '0932109876'),
(8,   2490000.00, 'CANCELLED', '56 Bạch Đằng, Hải Châu, Đà Nẵng',    '0932109876'),

-- Đỗ Thanh Tùng (id=9) - 2 đơn
(9,  28990000.00, 'PENDING',   '78 Lý Thường Kiệt, TP Huế',           '0921098765'),
(9,   7490000.00, 'PROCESSING', '78 Lý Thường Kiệt, TP Huế',           '0921098765'),

-- Bùi Hồng Nhung (id=10) - 1 đơn
(10, 34990000.00, 'DELIVERED',  '90 Trần Phú, Nha Trang',              '0910987654'),

-- Ngô Minh Khoa (id=11) - 1 đơn
(11,  8990000.00, 'SHIPPED',   '23 Phan Đình Phùng, Cần Thơ',         '0909876543');

-- ============================================================
-- 4. ORDER_DETAILS - 22 chi tiết đơn hàng
-- ============================================================
INSERT INTO order_details (order_id, product_id, quantity, price) VALUES
(1,  1, 1, 34990000.00),   -- Mai: iPhone 15
(2,  2, 1, 31990000.00),   -- Mai: Galaxy S24
(3,  4, 1, 28990000.00),   -- Mai: iPad Pro
(4,  6, 1, 10990000.00),   -- Mai: Apple Watch
(5,  5, 1,  5990000.00),   -- Mai: AirPods
(6,  1, 1, 34990000.00),   -- Hùng: iPhone 15
(7,  3, 1, 27990000.00),   -- Hùng: MacBook Air
(8,  7, 1,  7490000.00),   -- Hùng: Sony XM5
(9,  9, 1,  2490000.00),   -- Hùng: MX Master
(10, 8, 1, 42990000.00),   -- Ngọc: Dell XPS
(11, 2, 1, 31990000.00),   -- Ngọc: Galaxy S24
(12, 10,1,  8990000.00),   -- Ngọc: Samsung Monitor
(13, 1, 1, 34990000.00),   -- Đạt: iPhone 15
(14, 5, 1,  5990000.00),   -- Đạt: AirPods
(15, 3, 1, 27990000.00),   -- Lan: MacBook Air
(16, 6, 1, 10990000.00),   -- Lan: Apple Watch
(17, 2, 1, 31990000.00),   -- Đức Anh: Galaxy S24
(18, 9, 1,  2490000.00),   -- Đức Anh: MX Master
(19, 4, 1, 28990000.00),   -- Tùng: iPad Pro
(20, 7, 1,  7490000.00),   -- Tùng: Sony XM5
(21, 1, 1, 34990000.00),   -- Nhung: iPhone 15
(22, 10,1,  8990000.00);   -- Khoa: Samsung Monitor

-- ============================================================
-- 5. PAYMENTS - 22 bản ghi thanh toán
-- ============================================================
INSERT INTO payments (order_id, amount, payment_method, status, transaction_id) VALUES
-- DELIVERED → COMPLETED
(1,  34990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240101A'),
(2,  31990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240115B'),
(3,  28990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240201C'),
(4,  10990000.00, 'COD',           'COMPLETED', 'TRX-VNA-20240210D'),
(6,  34990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240220E'),
(7,  27990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240301F'),
(8,   7490000.00, 'COD',           'COMPLETED', 'TRX-VNA-20240310G'),
(10, 42990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240315H'),
(11, 31990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240320I'),
(13, 34990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240401J'),
(14,  5990000.00, 'COD',           'COMPLETED', 'TRX-VNA-20240405K'),
(15, 27990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240410L'),
(17, 31990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240415M'),
(21, 34990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240501N'),

-- SHIPPED → COMPLETED (đã trả tiền, đang giao)
(5,   5990000.00, 'VNPAY',         'COMPLETED', 'TRX-VNA-20240510O'),
(12,  8990000.00, 'BANK_TRANSFER', 'COMPLETED', 'TRX-VNA-20240512P'),

-- SHIPPED → COD PENDING
(22,  8990000.00, 'COD',           'PENDING',   NULL),

-- PROCESSING → PENDING
(9,   2490000.00, 'COD',           'PENDING',   NULL),
(20,  7490000.00, 'BANK_TRANSFER', 'PENDING',   NULL),

-- PENDING → PENDING
(16, 10990000.00, 'VNPAY',         'PENDING',   NULL),
(19, 28990000.00, 'COD',           'PENDING',   NULL),

-- CANCELLED → FAILED
(18,  2490000.00, 'BANK_TRANSFER', 'FAILED',    'TRX-VNA-20240420F1');

-- ============================================================
-- 6. SUPPORT_TICKETS - 5 ticket chính + 7 phản hồi
-- ============================================================

-- Ticket 1: Mai hỏi về giao hàng (OPEN, có 2 reply)
INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(NULL, 3, 5, 'Hỏi về tình trạng giao hàng',
 'Chào shop, đơn hàng AirPods Pro của tôi đã được giao chưa? Tôi đặt 3 ngày rồi mà chưa nhận được.', 0, 'OPEN');
SET @t1 = LAST_INSERT_ID();

INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(@t1, 1, 5, 'Hỏi về tình trạng giao hàng',
 'Chào chị Mai, đơn hàng của chị hiện đang trong quá trình vận chuyển. Dự kiến sẽ giao đến trong 1-2 ngày tới. Chị vui lòng chờ thêm nhé!', 1, 'OPEN'),
(@t1, 3, 5, 'Hỏi về tình trạng giao hàng',
 'Cảm ơn shop, tôi sẽ chờ thêm. Nhờ shop theo dõi giúp nhé!', 0, 'OPEN');

-- Ticket 2: Hùng yêu cầu đổi hàng (IN_PROGRESS, có 1 reply)
INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(NULL, 4, 8, 'Yêu cầu đổi sản phẩm',
 'Tôi nhận được tai nghe Sony XM5 nhưng bị lỗi noise cancelling. Tôi muốn đổi sản phẩm mới, làm thế nào để gửi trả hàng?', 0, 'IN_PROGRESS');
SET @t2 = LAST_INSERT_ID();

INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(@t2, 1, 8, 'Yêu cầu đổi sản phẩm',
 'Chào anh Hùng, rất xin lỗi vì sự bất tiện này. Chúng tôi sẽ gửi phiếu đổi trả miễn phí đến email của anh. Anh vui lòng đóng gói sản phẩm nguyên vẹn và gửi lại qua bưu điện gần nhất nhé.', 1, 'IN_PROGRESS');

-- Ticket 3: Ngọc yêu cầu hóa đơn VAT (OPEN, chưa reply)
INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(NULL, 5, 10, 'Yêu cầu xuất hóa đơn VAT',
 'Tôi cần xuất hóa đơn VAT cho đơn hàng Dell XPS 15. Thông tin công ty: Công ty ABC, MST: 0123456789. Nhờ shop hỗ trợ.', 0, 'OPEN');

-- Ticket 4: Đạt hỏi bảo hành (RESOLVED, có 2 reply)
INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(NULL, 6, 13, 'Thắc mắc về bảo hành iPhone',
 'iPhone 15 Pro Max tôi mua có được bảo hành quốc tế không? Tôi sắp đi công tác nước ngoài.', 0, 'RESOLVED');
SET @t4 = LAST_INSERT_ID();

INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(@t4, 1, 13, 'Thắc mắc về bảo hành iPhone',
 'Chào anh Đạt, iPhone 15 Pro Max mua tại shop được bảo hành chính hãng Apple toàn cầu 12 tháng. Anh có thể mang đến bất kỳ trung tâm Apple Authorized nào trên thế giới để được hỗ trợ.', 1, 'RESOLVED'),
(@t4, 6, 13, 'Thắc mắc về bảo hành iPhone',
 'Tuyệt vời! Cảm ơn shop đã hỗ trợ nhanh chóng!', 0, 'RESOLVED');

-- Ticket 5: Lan hỏi về thanh toán (OPEN, chưa reply)
INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status) VALUES
(NULL, 7, 16, 'Thanh toán VNPAY bị lỗi',
 'Tôi đã thanh toán qua VNPAY cho đơn Apple Watch nhưng hệ thống vẫn hiện trạng thái Pending. Tôi đã bị trừ tiền trong tài khoản.', 0, 'OPEN');

-- ============================================================
-- 7. CUSTOMER_ACTIVITIES - Lịch sử tương tác
-- ============================================================
INSERT INTO customer_activities (customer_id, staff_id, type, title, description) VALUES
(3, @tuan_id, 'CALL', 'Gọi xác nhận đơn hàng', 'Đã liên hệ chị Mai xác nhận đơn iPhone 15 Pro Max. Khách hài lòng.'),
(3, @tuan_id, 'NOTE', 'Ghi chú nội bộ', 'Khách hàng VIP, ưu tiên xử lý đơn nhanh.'),
(4, @tuan_id, 'EMAIL', 'Gửi email khuyến mãi', 'Đã gửi thông tin chương trình giảm giá cuối năm cho anh Hùng.'),
(5, @ha_id, 'MEETING', 'Tư vấn sản phẩm', 'Gặp trực tiếp chị Ngọc tư vấn về Dell XPS 15 và MacBook Air.'),
(7, @ha_id, 'CALL', 'Hỗ trợ thanh toán', 'Hướng dẫn chị Lan thanh toán qua VNPAY.');

-- ============================================================
-- TỔNG KẾT DỮ LIỆU MẪU
-- ============================================================
-- Users:           2 ADMIN + 9 USER = 11 tài khoản
-- Products:        10 sản phẩm
-- Orders:          22 đơn hàng (14 DELIVERED, 3 SHIPPED, 2 PROCESSING, 2 PENDING, 1 CANCELLED)
-- Order Details:   22 chi tiết
-- Payments:        22 bản ghi (16 COMPLETED, 5 PENDING, 1 FAILED)
-- Support Tickets: 5 ticket chính + 7 phản hồi = 12 bản ghi
--
-- ╔═══════════════════════════════════════╗
-- ║  ĐĂNG NHẬP ADMIN                     ║
-- ║  Email:    admin@vietanh.com          ║
-- ║  Password: password                   ║
-- ╚═══════════════════════════════════════╝
