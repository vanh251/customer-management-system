<?php
// ============================================================
// Add Customer API - POST
// Creates a new user with role='USER'
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được phép.']);
    exit;
}

$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$password  = trim($_POST['password'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$address   = trim($_POST['address'] ?? '');
$birthday  = !empty($_POST['birthday']) ? $_POST['birthday'] : null;
$customer_source = trim($_POST['customer_source'] ?? '');
$customer_group  = trim($_POST['customer_group'] ?? '');
$customer_tier   = trim($_POST['customer_tier'] ?? 'NONE');
$tags      = trim($_POST['tags'] ?? '');
$status    = trim($_POST['status'] ?? 'ACTIVE');

// Validate required fields
if (empty($full_name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.']);
    exit;
}

try {
    // Check if email already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email này đã tồn tại trong hệ thống.']);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new customer
    $stmt = $pdo->prepare("
        INSERT INTO users (
            full_name, email, password, phone, address, role, assigned_staff_id, status, created_at,
            birthday, customer_source, customer_group, customer_tier, tags
        ) 
        VALUES (
            :full_name, :email, :password, :phone, :address, 'USER', :staff_id, :status, NOW(),
            :birthday, :customer_source, :customer_group, :customer_tier, :tags
        )
    ");
    $stmt->execute([
        ':full_name'      => $full_name,
        ':email'          => $email,
        ':password'       => $hashedPassword,
        ':phone'          => $phone,
        ':address'        => $address,
        ':staff_id'       => $_SESSION['admin_id'],
        ':status'         => $status,
        ':birthday'       => $birthday,
        ':customer_source'=> $customer_source,
        ':customer_group' => $customer_group,
        ':customer_tier'  => $customer_tier,
        ':tags'           => $tags,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Thêm khách hàng thành công!',
        'data'    => ['id' => $pdo->lastInsertId()]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
