<?php
// ============================================================
// Resolve Ticket API - POST
// Updates ticket status to RESOLVED
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$ticketId = (int) ($_POST['ticket_id'] ?? 0);

if ($ticketId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Ticket ID không hợp lệ.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE support_tickets SET status = 'RESOLVED' WHERE id = :id AND parent_id IS NULL");
    $stmt->execute([':id' => $ticketId]);

    if ($stmt->rowCount() > 0) {
        // Also update all replies' status
        $stmt2 = $pdo->prepare("UPDATE support_tickets SET status = 'RESOLVED' WHERE parent_id = :parent_id");
        $stmt2->execute([':parent_id' => $ticketId]);

        echo json_encode(['success' => true, 'message' => 'Ticket đã được giải quyết!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy ticket.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
