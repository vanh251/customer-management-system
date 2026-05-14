<?php
// ============================================================
// Add Staff API - POST
// Creates a new user with role='STAFF'. Admin only.
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$password  = $_POST['password'] ?? '';
$phone     = trim($_POST['phone'] ?? '');
$address   = trim($_POST['address'] ?? '');

if (empty($full_name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.']);
    exit;
}

try {
    // Check duplicate email
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email này đã tồn tại trong hệ thống.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, email, password, phone, address, role, status, created_at) 
        VALUES (:full_name, :email, :password, :phone, :address, 'STAFF', 'ACTIVE', NOW())
    ");
    $stmt->execute([
        ':full_name' => $full_name,
        ':email'     => $email,
        ':password'  => $hashedPassword,
        ':phone'     => $phone,
        ':address'   => $address,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Thêm nhân viên thành công!',
        'data'    => ['id' => $pdo->lastInsertId()]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
