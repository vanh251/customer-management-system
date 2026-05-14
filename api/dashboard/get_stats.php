<?php
// ============================================================
// Dashboard Stats API - GET
// Returns: monthly metrics and growth compared to previous month
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

try {
    // Hàm phụ trợ tính phần trăm tăng trưởng
    function calcGrowth($current, $previous) {
        if ($previous > 0) {
            return round((($current - $previous) / $previous) * 100, 1);
        }
        return $current > 0 ? 100 : 0;
    }

    // 1. Doanh thu trong tháng (Monthly Revenue)
    $stmt = $pdo->query("SELECT COALESCE(SUM(o.total_amount), 0) as total FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE (p.status = 'COMPLETED' OR o.status = 'COMPLETED') AND MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())");
    $revenueThisMonth = (float) $stmt->fetch()['total'];

    $stmt = $pdo->query("SELECT COALESCE(SUM(o.total_amount), 0) as total FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE (p.status = 'COMPLETED' OR o.status = 'COMPLETED') AND MONTH(o.created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(o.created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))");
    $revenueLastMonth = (float) $stmt->fetch()['total'];

    $revenueGrowth = calcGrowth($revenueThisMonth, $revenueLastMonth);

    // 2. Khách hàng mới trong tháng
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'USER' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
    $customersThisMonth = (int) $stmt->fetch()['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'USER' AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))");
    $customersLastMonth = (int) $stmt->fetch()['count'];

    $customersGrowth = calcGrowth($customersThisMonth, $customersLastMonth);

    // 3. Đơn hàng mới trong tháng
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
    $ordersThisMonth = (int) $stmt->fetch()['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders WHERE MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))");
    $ordersLastMonth = (int) $stmt->fetch()['count'];

    $ordersGrowth = calcGrowth($ordersThisMonth, $ordersLastMonth);

    // 4. Số lượng Yêu cầu hỗ trợ (All time open) - giữ lại chỉ số này để cho Staff xử lý
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM support_tickets WHERE parent_id IS NULL AND status != 'RESOLVED'");
    $openTickets = (int) $stmt->fetch()['count'];

    echo json_encode([
        'success' => true,
        'data'    => [
            'revenue' => [
                'value'  => $revenueThisMonth,
                'growth' => $revenueGrowth
            ],
            'new_customers' => [
                'value'  => $customersThisMonth,
                'growth' => $customersGrowth
            ],
            'new_orders' => [
                'value'  => $ordersThisMonth,
                'growth' => $ordersGrowth
            ],
            'open_tickets' => [
                'value' => $openTickets,
                'growth' => 0 // Not tracking growth for open tickets
            ]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
