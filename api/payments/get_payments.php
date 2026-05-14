<?php
// ============================================================
// Get Payments API - GET
// Returns orders + payment info (JOIN orders + payments + users)
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$statusFilter = trim($_GET['status'] ?? 'all');
$methodFilter = trim($_GET['method'] ?? 'all');
$search       = trim($_GET['search'] ?? '');

try {
    $sql = "
        SELECT 
            o.id, o.user_id, o.total_amount, o.shipping_address, o.shipping_phone,
            o.status as order_status, o.created_at, o.updated_at,
            p.payment_method, p.status as payment_status, p.transaction_id,
            u.full_name as customer_name, u.email as customer_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE 1=1
    ";
    $params = [];

    // Payment status filter
    if ($statusFilter !== 'all') {
        $sql .= " AND p.status = :status";
        $params[':status'] = strtoupper($statusFilter);
    }

    // Payment method filter
    if ($methodFilter !== 'all') {
        $sql .= " AND p.payment_method = :method";
        $params[':method'] = strtoupper($methodFilter);
    }

    // Search by order ID
    if (!empty($search)) {
        $sql .= " AND o.id LIKE :search";
        $params[':search'] = "%{$search}%";
    }

    $sql .= " ORDER BY o.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $payments,
        'total'   => count($payments)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
