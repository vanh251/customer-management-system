<?php
// ============================================================
// API Vô hiệu hóa nhân viên - Phương thức POST
// Chuyển quyền và trạng thái của nhân viên thành 'INACTIVE'. Chỉ dành cho Admin.
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$id = intval($_POST['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID nhân viên không hợp lệ.']);
    exit;
}

try {
    // Gỡ phân công đối với tất cả khách hàng do nhân viên này phụ trách trước khi vô hiệu hóa
    $pdo->prepare("UPDATE users SET assigned_staff_id = NULL WHERE assigned_staff_id = :id")->execute([':id' => $id]);

    $stmt = $pdo->prepare("UPDATE users SET role = 'INACTIVE', status = 'INACTIVE' WHERE id = :id AND role = 'STAFF'");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy nhân viên.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Đã vô hiệu hóa nhân viên thành công!']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
