<?php
// ============================================================
// Export Customers CSV - GET
// Exports customer list to CSV file download
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

try {
    $sql = "
        SELECT u.id, u.full_name, u.email, u.phone, u.address, u.birthday,
               u.customer_source, u.customer_group, u.customer_tier, u.tier_discount,
               u.tags, u.status, u.created_at,
               s.full_name as staff_name
        FROM users u
        LEFT JOIN users s ON u.assigned_staff_id = s.id
        WHERE u.role = 'USER'
        ORDER BY u.created_at DESC
    ";
    $stmt = $pdo->query($sql);
    $customers = $stmt->fetchAll();

    // Set CSV headers
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="khach_hang_' . date('Y-m-d') . '.csv"');

    $output = fopen('php://output', 'w');
    // BOM for Excel UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Header row
    fputcsv($output, ['ID', 'Họ tên', 'Email', 'SĐT', 'Địa chỉ', 'Sinh nhật', 'Nguồn', 'Nhóm', 'Hạng', 'Giảm giá (%)', 'Tags', 'Trạng thái', 'Người phụ trách', 'Ngày tạo']);

    foreach ($customers as $c) {
        fputcsv($output, [
            $c['id'],
            $c['full_name'],
            $c['email'],
            $c['phone'],
            $c['address'],
            $c['birthday'],
            $c['customer_source'],
            $c['customer_group'],
            $c['customer_tier'],
            $c['tier_discount'],
            $c['tags'],
            $c['status'],
            $c['staff_name'],
            $c['created_at'],
        ]);
    }

    fclose($output);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
