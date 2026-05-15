<?php
// ============================================================
// API Cập nhật thông tin khách hàng - Phương thức POST
// Chỉ cập nhật thông tin cho người dùng có vai trò là 'USER'
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$id        = (int) ($_POST['id'] ?? 0);
$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$address   = trim($_POST['address'] ?? '');
$birthday  = !empty($_POST['birthday']) ? $_POST['birthday'] : null;
$customer_source = trim($_POST['customer_source'] ?? '');
$customer_group  = trim($_POST['customer_group'] ?? '');
$customer_tier   = trim($_POST['customer_tier'] ?? 'NONE');
$tags      = trim($_POST['tags'] ?? '');
$status    = trim($_POST['status'] ?? 'ACTIVE');

// Xác thực dữ liệu cơ bản
if ($id <= 0 || empty($full_name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ ID, họ tên và email.']);
    exit;
}

try {
    // Kiểm tra xem email có bị trùng với tài khoản khác không (ngoại trừ chính khách hàng này)
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
    $stmt->execute([':email' => $email, ':id' => $id]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email đã được sử dụng bởi tài khoản khác.']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE users 
        SET full_name = :full_name, email = :email, phone = :phone, address = :address,
            birthday = :birthday, customer_source = :customer_source, customer_group = :customer_group,
            customer_tier = :customer_tier, tags = :tags, status = :status
        WHERE id = :id AND role = 'USER'
    ");
    $stmt->execute([
        ':full_name'      => $full_name,
        ':email'          => $email,
        ':phone'          => $phone,
        ':address'        => $address,
        ':birthday'       => $birthday,
        ':customer_source'=> $customer_source,
        ':customer_group' => $customer_group,
        ':customer_tier'  => $customer_tier,
        ':tags'           => $tags,
        ':status'         => $status,
        ':id'             => $id,
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật khách hàng thành công!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy khách hàng hoặc không có thay đổi.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
