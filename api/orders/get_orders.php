<?php
// ============================================================
// Get Orders API - GET
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$status = trim($_GET['status'] ?? '');
$search = trim($_GET['search'] ?? '');

try {
    $sql = "
        SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at,
               p.status as payment_status,
               u.full_name as customer_name, u.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE 1=1
    ";
    
    $params = [];

    if (!empty($status)) {
        $sql .= " AND o.status = :status";
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $sql .= " AND (o.id LIKE :search OR u.full_name LIKE :search2 OR u.phone LIKE :search3)";
        $searchTerm = "%{$search}%";
        $params[':search']  = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
    }

    $sql .= " ORDER BY o.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $orders,
        'total'   => count($orders)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
