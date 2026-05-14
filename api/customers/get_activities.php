<?php
// ============================================================
// Get Customer Activities (Timeline) - GET
// Returns activity history for a specific customer
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$customer_id = intval($_GET['customer_id'] ?? 0);

if ($customer_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Customer ID không hợp lệ.']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT a.*, s.full_name as staff_name
        FROM customer_activities a
        JOIN users s ON a.staff_id = s.id
        WHERE a.customer_id = :cid
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([':cid' => $customer_id]);
    $activities = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $activities
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
