<?php
// ============================================================
// API Lấy danh sách nhân viên - Phương thức GET
// Lấy danh sách tất cả người dùng có vai trò là 'STAFF', kèm theo số lượng khách hàng họ đang quản lý
// Chỉ dành cho Admin
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN');

$search = trim($_GET['search'] ?? '');

try {
    $sql = "
        SELECT u.id, u.full_name, u.email, u.phone, u.address, u.avatar_url, 
               u.created_at, u.status,
               (SELECT COUNT(*) FROM users c WHERE c.assigned_staff_id = u.id AND c.role = 'USER') as customer_count
        FROM users u
        WHERE u.role = 'STAFF'
    ";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (u.full_name LIKE :search OR u.email LIKE :search2 OR u.phone LIKE :search3)";
        $searchTerm = "%{$search}%";
        $params[':search']  = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
    }

    $sql .= " ORDER BY u.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $staff = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $staff,
        'total'   => count($staff)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
