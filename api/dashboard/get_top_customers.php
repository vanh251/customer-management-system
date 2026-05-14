<?php
// ============================================================
// Top Customers API - GET
// Returns top customers ranked by total spending (COMPLETED payments)
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';

$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
if ($limit < 1 || $limit > 50) $limit = 10;

try {
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.full_name,
            u.email,
            u.avatar_url,
            u.phone,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(p.amount), 0) as total_spent,
            MAX(o.created_at) as last_purchase
        FROM users u
        JOIN orders o ON u.id = o.user_id
        JOIN payments p ON o.id = p.order_id AND p.status = 'COMPLETED'
        WHERE u.role = 'USER'
        GROUP BY u.id, u.full_name, u.email, u.avatar_url, u.phone
        ORDER BY total_spent DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $customers = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $customers
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
