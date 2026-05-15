<?php
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';

// Cả ADMIN và STAFF đều có quyền xóa khách hàng
require_role('ADMIN', 'STAFF');

$id = intval($_POST['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID khách hàng không hợp lệ.']);
    exit;
}

try {
    // Để an toàn, hệ thống sẽ kiểm tra xem khách hàng có đơn hàng nào không.
    // Nếu có, dùng lệnh DELETE có thể sẽ bị khóa ngoại (Foreign Key) cản lại.
    // Tạm thời nếu DB cấu hình RESTRICT thì sẽ bắt lỗi PDOException.
    
    // Kiểm tra xem khách hàng có tồn tại không
    $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = :id AND role = 'USER'");
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Khách hàng không tồn tại.']);
        exit;
    }

    // Thực hiện xóa từ cơ sở dữ liệu
    // Nếu có ràng buộc khóa ngoại (ví dụ: đã có đơn hàng), lệnh này sẽ quăng lỗi 23000
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id AND role = 'USER'");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'Đã xóa khách hàng thành công.']);

} catch (PDOException $e) {
    // Nếu lỗi là do Foreign Key constraint
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Không thể xóa khách hàng này vì họ đã có dữ liệu đơn hàng/thanh toán.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
    }
}
?>
