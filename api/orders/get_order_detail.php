<?php
// ============================================================
// API Lấy chi tiết đơn hàng - Phương thức GET
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$order_id = intval($_GET['order_id'] ?? 0);

if ($order_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ.']);
    exit;
}

try {
    // 1. Lấy thông tin chung của đơn hàng
    $stmt = $pdo->prepare("
        SELECT o.*, p.status as payment_status,
               u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone, u.address as customer_address
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = :id
    ");
    $stmt->execute([':id' => $order_id]);
    $order = $stmt->fetch();

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng.']);
        exit;
    }

    // 2. Lấy danh sách sản phẩm trong đơn hàng
    $stmt = $pdo->prepare("
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_details oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = :id
    ");
    $stmt->execute([':id' => $order_id]);
    $items = $stmt->fetchAll();

    $order['items'] = $items;

    echo json_encode([
        'success' => true,
        'data'    => $order
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
