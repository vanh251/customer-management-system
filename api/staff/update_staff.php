<?php
// ============================================================
// API Cập nhật thông tin nhân viên - Phương thức POST
// Chỉ dành cho Admin.
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$id        = intval($_POST['id'] ?? 0);
$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$address   = trim($_POST['address'] ?? '');

if ($id <= 0 || empty($full_name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Thiếu thông tin bắt buộc.']);
    exit;
}

try {
    // Kiểm tra xem email có trùng với nhân viên khác hay không
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
    $check->execute([':email' => $email, ':id' => $id]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email này đã được sử dụng bởi tài khoản khác.']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE users SET full_name = :full_name, email = :email, phone = :phone, address = :address
        WHERE id = :id AND role = 'STAFF'
    ");
    $stmt->execute([
        ':full_name' => $full_name,
        ':email'     => $email,
        ':phone'     => $phone,
        ':address'   => $address,
        ':id'        => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy nhân viên hoặc không có thay đổi.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Cập nhật nhân viên thành công!']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
