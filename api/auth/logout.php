<?php
// ============================================================
// API Đăng xuất - Phương thức POST
// Hủy bỏ phiên đăng nhập hiện tại (Session)
// ============================================================
session_start();
session_unset();
session_destroy();
echo json_encode(['success' => true]);
?>
