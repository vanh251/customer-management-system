<?php
// ============================================================
// API Thêm hoạt động khách hàng - Phương thức POST
// Lưu lại lịch sử tương tác (gọi điện, họp, email, ghi chú) với khách hàng
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$customer_id = intval($_POST['customer_id'] ?? 0);
$type        = trim($_POST['type'] ?? '');
$title       = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');

if ($customer_id <= 0 || empty($type) || empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin.']);
    exit;
}

$validTypes = ['CALL', 'MEETING', 'EMAIL', 'NOTE'];
if (!in_array($type, $validTypes)) {
    echo json_encode(['success' => false, 'message' => 'Loại hoạt động không hợp lệ.']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO customer_activities (customer_id, staff_id, type, title, description, created_at)
        VALUES (:cid, :sid, :type, :title, :desc, NOW())
    ");
    $stmt->execute([
        ':cid'   => $customer_id,
        ':sid'   => $_SESSION['admin_id'],
        ':type'  => $type,
        ':title' => $title,
        ':desc'  => $description,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Đã thêm hoạt động thành công!',
        'data'    => ['id' => $pdo->lastInsertId()]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
