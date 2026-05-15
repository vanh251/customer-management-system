<?php
// ============================================================
// API Lấy dữ liệu biểu đồ - Phương thức GET
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

try {
    $filter = $_GET['filter'] ?? '7_days';
    $labels = [];
    $revenue_values = [];
    $customer_values = [];

    if ($filter === '1_year') {
        // Doanh thu
        $sqlRev = "
            SELECT DATE_FORMAT(o.created_at, '%Y-%m') as period, SUM(o.total_amount) as revenue
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            WHERE (o.status = 'DELIVERED' OR o.status = 'COMPLETED' OR p.status = 'COMPLETED' OR p.status = 'PAID')
              AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY period
            ORDER BY period ASC
        ";
        $stmt = $pdo->query($sqlRev);
        $dataRev = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Khách hàng
        $sqlCus = "
            SELECT DATE_FORMAT(created_at, '%Y-%m') as period, COUNT(*) as customers
            FROM users
            WHERE role = 'USER' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY period
            ORDER BY period ASC
        ";
        $stmt = $pdo->query($sqlCus);
        $dataCus = $stmt->fetchAll(PDO::FETCH_ASSOC);

        for ($i = 11; $i >= 0; $i--) {
            $month = date('Y-m', strtotime("-$i months"));
            $labels[] = "T" . date('n', strtotime("-$i months"));
            
            $rev = 0;
            foreach ($dataRev as $row) {
                if ($row['period'] === $month) {
                    $rev = (float)$row['revenue'];
                    break;
                }
            }
            $revenue_values[] = $rev;

            $cus = 0;
            foreach ($dataCus as $row) {
                if ($row['period'] === $month) {
                    $cus = (int)$row['customers'];
                    break;
                }
            }
            $customer_values[] = $cus;
        }
    } else {
        // 7_days or 1_month
        $days = ($filter === '1_month') ? 29 : 6;
        $sqlRev = "
            SELECT DATE(o.created_at) as period, SUM(o.total_amount) as revenue
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            WHERE (o.status = 'DELIVERED' OR o.status = 'COMPLETED' OR p.status = 'COMPLETED' OR p.status = 'PAID')
              AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL $days DAY)
            GROUP BY period
            ORDER BY period ASC
        ";
        $stmt = $pdo->query($sqlRev);
        $dataRev = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sqlCus = "
            SELECT DATE(created_at) as period, COUNT(*) as customers
            FROM users
            WHERE role = 'USER' AND created_at >= DATE_SUB(CURDATE(), INTERVAL $days DAY)
            GROUP BY period
            ORDER BY period ASC
        ";
        $stmt = $pdo->query($sqlCus);
        $dataCus = $stmt->fetchAll(PDO::FETCH_ASSOC);

        for ($i = $days; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $labels[] = date('d/m', strtotime("-$i days"));
            
            $rev = 0;
            foreach ($dataRev as $row) {
                if ($row['period'] === $date) {
                    $rev = (float)$row['revenue'];
                    break;
                }
            }
            $revenue_values[] = $rev;

            $cus = 0;
            foreach ($dataCus as $row) {
                if ($row['period'] === $date) {
                    $cus = (int)$row['customers'];
                    break;
                }
            }
            $customer_values[] = $cus;
        }
    }

    echo json_encode([
        'success' => true,
        'data'    => [
            'labels' => $labels,
            'revenue_values' => $revenue_values,
            'customer_values' => $customer_values
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
}
?>
