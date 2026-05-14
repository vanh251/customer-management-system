<?php
// ============================================================
// Reply Ticket API - POST
// Admin replies to a support ticket
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
$message  = trim($_POST['message'] ?? '');

if ($ticketId <= 0 || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập ticket ID và nội dung tin nhắn.']);
    exit;
}

try {
    // Verify parent ticket exists
    $stmt = $pdo->prepare("SELECT id, subject, order_id FROM support_tickets WHERE id = :id AND parent_id IS NULL");
    $stmt->execute([':id' => $ticketId]);
    $parentTicket = $stmt->fetch();

    if (!$parentTicket) {
        echo json_encode(['success' => false, 'message' => 'Ticket gốc không tồn tại.']);
        exit;
    }

    // Insert admin reply
    $stmt = $pdo->prepare("
        INSERT INTO support_tickets (parent_id, user_id, order_id, subject, message, is_admin_reply, status, created_at)
        VALUES (:parent_id, :user_id, :order_id, :subject, :message, 1, 'OPEN', NOW())
    ");
    $stmt->execute([
        ':parent_id' => $ticketId,
        ':user_id'   => $_SESSION['admin_id'],
        ':order_id'  => $parentTicket['order_id'],
        ':subject'   => $parentTicket['subject'],
        ':message'   => $message,
    ]);

    $newReplyId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Phản hồi đã được gửi!',
        'data'    => [
            'id'             => (int) $newReplyId,
            'parent_id'      => $ticketId,
            'message'        => $message,
            'is_admin_reply' => 1,
            'full_name'      => $_SESSION['admin_name'],
            'created_at'     => date('Y-m-d H:i:s'),
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
