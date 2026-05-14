<?php
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$order_id       = intval($_POST['order_id'] ?? 0);
$payment_method = trim($_POST['payment_method'] ?? '');
$payment_status = trim($_POST['payment_status'] ?? '');
$transaction_id = trim($_POST['transaction_id'] ?? '');

if ($order_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID không hợp lệ.']);
    exit;
}

try {
    // Check if payment record exists
    $stmt = $pdo->prepare("SELECT id FROM payments WHERE order_id = :order_id");
    $stmt->execute([':order_id' => $order_id]);
    $payment = $stmt->fetch();

    if ($payment) {
        // Update existing payment
        $stmt = $pdo->prepare("
            UPDATE payments 
            SET payment_method = :method, status = :status, transaction_id = :tid, updated_at = NOW() 
            WHERE order_id = :order_id
        ");
        $stmt->execute([
            ':method'   => $payment_method,
            ':status'   => $payment_status,
            ':tid'      => $transaction_id,
            ':order_id' => $order_id
        ]);
    } else {
        // Create new payment record if it doesn't exist (though usually it should exist with 'PENDING')
        // In this system, we fetch payments via LEFT JOIN on orders, so it's possible no record exists in `payments` table.
        // We'll also need the amount, let's get it from orders.
        $stmtOrder = $pdo->prepare("SELECT total_amount FROM orders WHERE id = :id");
        $stmtOrder->execute([':id' => $order_id]);
        $orderData = $stmtOrder->fetch();
        
        if ($orderData) {
            $stmt = $pdo->prepare("
                INSERT INTO payments (order_id, amount, payment_method, status, transaction_id, created_at, updated_at)
                VALUES (:order_id, :amount, :method, :status, :tid, NOW(), NOW())
            ");
            $stmt->execute([
                ':order_id' => $order_id,
                ':amount'   => $orderData['total_amount'],
                ':method'   => $payment_method,
                ':status'   => $payment_status,
                ':tid'      => $transaction_id
            ]);
        }
    }

    // Also update order payment status if needed (optional depending on system design)
    // Here we'll just say success
    echo json_encode(['success' => true, 'message' => 'Cập nhật thanh toán thành công.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
