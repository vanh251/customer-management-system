<?php
// ============================================================
// Role-Based Access Control Middleware
// Usage: require_role('ADMIN');
//        require_role('ADMIN', 'STAFF');
// ============================================================

function require_role(...$roles) {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['admin_role'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập.']);
        exit;
    }
    if (!in_array($_SESSION['admin_role'], $roles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Không có quyền truy cập chức năng này.']);
        exit;
    }
}
?>
