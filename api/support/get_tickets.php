<?php
// ============================================================
// API Lấy danh sách yêu cầu hỗ trợ - Phương thức GET
// Trả về các yêu cầu gốc (parent_id IS NULL) + các phản hồi trong cuộc trò chuyện
// ============================================================
require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../auth/check_role.php';
require_role('ADMIN', 'STAFF');

$ticketId = isset($_GET['ticket_id']) ? (int) $_GET['ticket_id'] : 0;

try {
    if ($ticketId > 0) {
        // Lấy thông tin một yêu cầu cụ thể + toàn bộ chuỗi tin nhắn của nó
        // 1. Lấy thông tin yêu cầu gốc
        $stmt = $pdo->prepare("
            SELECT t.*, u.full_name, u.email, u.avatar_url
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = :id AND t.parent_id IS NULL
        ");
        $stmt->execute([':id' => $ticketId]);
        $ticket = $stmt->fetch();

        if (!$ticket) {
            echo json_encode(['success' => false, 'message' => 'Ticket not found.']);
            exit;
        }

        // 2. Lấy tất cả các phản hồi (tin nhắn) thuộc về yêu cầu này
        $stmt = $pdo->prepare("
            SELECT t.*, u.full_name, u.email, u.avatar_url
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.parent_id = :parent_id
            ORDER BY t.created_at ASC
        ");
        $stmt->execute([':parent_id' => $ticketId]);
        $replies = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data'    => [
                'ticket'  => $ticket,
                'replies' => $replies
            ]
        ]);

    } else {
        // Lấy danh sách tất cả các yêu cầu hỗ trợ gốc (để hiển thị ở sidebar)
        $stmt = $pdo->query("
            SELECT t.*, u.full_name, u.email, u.avatar_url,
                   (SELECT COUNT(*) FROM support_tickets r WHERE r.parent_id = t.id) as reply_count
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.parent_id IS NULL
            ORDER BY t.created_at DESC
        ");
        $tickets = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data'    => $tickets,
            'total'   => count($tickets)
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
