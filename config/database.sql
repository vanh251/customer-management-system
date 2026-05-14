-- ============================================================
-- DATABASE DDL - vietanh_store
-- File này tạo database và tất cả các bảng cần thiết
-- Chạy file này TRƯỚC khi chạy seed_data.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS vietanh_store
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vietanh_store;

-- ============================================================
-- 1. BẢNG USERS - Người dùng (Admin + Khách hàng)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    address TEXT,
    birthday DATE DEFAULT NULL,
    customer_source VARCHAR(50) DEFAULT NULL,
    customer_group VARCHAR(50) DEFAULT NULL,
    customer_tier ENUM('NONE','SILVER','GOLD','PLATINUM','DIAMOND') DEFAULT 'NONE',
    tier_discount DECIMAL(5,2) DEFAULT 0.00,
    tags VARCHAR(255) DEFAULT NULL,
    assigned_staff_id INT DEFAULT NULL,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    role ENUM('USER', 'ADMIN', 'STAFF', 'INACTIVE') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. BẢNG PRODUCTS - Sản phẩm
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    old_price DECIMAL(15, 2) DEFAULT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255) DEFAULT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT NULL,
    status ENUM('ACTIVE','HIDDEN') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. BẢNG ORDERS - Đơn hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. BẢNG ORDER_DETAILS - Chi tiết đơn hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. BẢNG PAYMENTS - Thanh toán
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('COD', 'VNPAY', 'BANK_TRANSFER') DEFAULT 'COD',
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. BẢNG SUPPORT_TICKETS - Vé hỗ trợ khách hàng
-- parent_id = NULL → ticket chính
-- parent_id = INT  → phản hồi (reply) của ticket
-- is_admin_reply = 0 → khách hàng gửi
-- is_admin_reply = 1 → admin trả lời
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT DEFAULT NULL,
    user_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    subject VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    is_admin_reply TINYINT(1) DEFAULT 0,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BẢNG CUSTOMER_ACTIVITIES - Lịch sử tương tác
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    type ENUM('CALL','MEETING','EMAIL','NOTE') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEX bổ sung để tối ưu truy vấn
-- ============================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_assigned_staff ON users(assigned_staff_id);
CREATE INDEX idx_users_tier ON users(customer_tier);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_order_details_order_id ON order_details(order_id);
CREATE INDEX idx_support_tickets_parent_id ON support_tickets(parent_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_activities_customer ON customer_activities(customer_id);
CREATE INDEX idx_activities_staff ON customer_activities(staff_id);
