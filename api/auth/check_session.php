<?php
// ============================================================
// Session Guard - Include this in all admin API endpoints
// ============================================================
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}
?>
