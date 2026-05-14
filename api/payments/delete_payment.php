<?php
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN'); // Only Admin can delete

$order_id = intval($_POST['id'] ?? 0);

if ($order_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID không hợp lệ.']);
    exit;
}

try {
    // We only delete the payment record, keeping the order for history
    $stmt = $pdo->prepare("DELETE FROM payments WHERE order_id = :id");
    $stmt->execute([':id' => $order_id]);

    echo json_encode(['success' => true, 'message' => 'Xóa thông tin thanh toán thành công.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
