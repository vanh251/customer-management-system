<?php
// ============================================================
// API Đăng nhập - Phương thức POST: email, password
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Xác thực dữ liệu đầu vào
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ email và mật khẩu.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, full_name, email, avatar_url, password, role FROM users WHERE email = :email AND role IN ('ADMIN', 'STAFF') AND status = 'ACTIVE' LIMIT 1");
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['success' => false, 'message' => 'Email không tồn tại hoặc không có quyền truy cập.']);
        exit;
    }

    // Kiểm tra mật khẩu (hash)
    if (!password_verify($password, $admin['password'])) {
        echo json_encode(['success' => false, 'message' => 'Mật khẩu không chính xác.']);
        exit;
    }

    // Lưu thông tin vào Session
    $_SESSION['admin_id']     = $admin['id'];
    $_SESSION['admin_name']   = $admin['full_name'];
    $_SESSION['admin_email']  = $admin['email'];
    $_SESSION['admin_avatar'] = $admin['avatar_url'];
    $_SESSION['admin_role']   = $admin['role'];

    echo json_encode([
        'success' => true,
        'message' => 'Đăng nhập thành công!',
        'data'    => [
            'id'         => $admin['id'],
            'full_name'  => $admin['full_name'],
            'email'      => $admin['email'],
            'avatar_url' => $admin['avatar_url'],
            'role'       => $admin['role'],
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
