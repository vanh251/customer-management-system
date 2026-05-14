<?php
// ============================================================
// Logout API - POST
// Destroys the current session
// ============================================================
session_start();
session_unset();
session_destroy();
echo json_encode(['success' => true]);
?>
