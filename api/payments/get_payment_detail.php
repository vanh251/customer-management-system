<?php
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$order_id = intval($_GET['id'] ?? 0);

if ($order_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID không hợp lệ.']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            o.id, o.user_id, o.total_amount, o.status as order_status, o.created_at,
            p.payment_method, p.status as payment_status, p.transaction_id, p.updated_at as payment_date,
            u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = :id
    ");
    $stmt->execute([':id' => $order_id]);
    $payment = $stmt->fetch();

    if (!$payment) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy thông tin thanh toán.']);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $payment]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
