<?php
// ============================================================
// API Cập nhật trạng thái đơn hàng - Phương thức POST
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$order_id = intval($_POST['order_id'] ?? 0);
$status   = trim($_POST['status'] ?? '');

$validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

if ($order_id <= 0 || !in_array($status, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
    $stmt->execute([
        ':status' => $status,
        ':id'     => $order_id
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật trạng thái thành công.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Đơn hàng không tồn tại hoặc trạng thái không đổi.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
