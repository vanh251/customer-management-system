<?php
// ============================================================
// Get Customers API - GET
// Returns all users with role='USER', supports search
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$search = trim($_GET['search'] ?? '');
$tier   = trim($_GET['tier'] ?? '');
$group  = trim($_GET['group'] ?? '');
$status = trim($_GET['status'] ?? '');

try {
    $sql = "
        SELECT u.id, u.full_name, u.email, u.phone, u.address, u.avatar_url, u.role, u.created_at,
               u.birthday, u.customer_source, u.customer_group, u.customer_tier, u.tier_discount, u.tags, u.status,
               s.full_name as staff_name
        FROM users u
        LEFT JOIN users s ON u.assigned_staff_id = s.id
        WHERE u.role = 'USER'
    ";
    
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (u.full_name LIKE :search OR u.email LIKE :search2 OR u.phone LIKE :search3)";
        $searchTerm = "%{$search}%";
        $params[':search']  = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
    }

    if (!empty($tier)) {
        $sql .= " AND u.customer_tier = :tier";
        $params[':tier'] = $tier;
    }
    
    if (!empty($group)) {
        $sql .= " AND u.customer_group = :group";
        $params[':group'] = $group;
    }
    
    if (!empty($status)) {
        $sql .= " AND u.status = :status";
        $params[':status'] = $status;
    }

    $sql .= " ORDER BY u.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $customers = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $customers,
        'total'   => count($customers)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
