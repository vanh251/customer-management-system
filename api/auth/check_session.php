<?php
// ============================================================
// Bảo vệ phiên đăng nhập (Session Guard) - Bao gồm file này ở mọi API cần bảo mật
// ============================================================
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}
?>
