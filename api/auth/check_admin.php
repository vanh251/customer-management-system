<?php
// ============================================================
// API Kiểm tra phiên đăng nhập (Session) - Phương thức GET
// Trả về thông tin người dùng nếu đang đăng nhập hợp lệ
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';

if (isset($_SESSION['admin_id'])) {
    echo json_encode([
        'success' => true,
        'data' => [
            'id'         => $_SESSION['admin_id'],
            'full_name'  => $_SESSION['admin_name'] ?? '',
            'email'      => $_SESSION['admin_email'] ?? '',
            'avatar_url' => $_SESSION['admin_avatar'] ?? '',
            'role'       => $_SESSION['admin_role'] ?? 'ADMIN',
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập.']);
}
?>
