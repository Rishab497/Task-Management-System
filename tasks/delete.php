<?php
/**
 * Delete Task Endpoint
 * Deletes a task for the authenticated user
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';

// Set CORS headers
setCorsHeaders();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Invalid request method', 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


// Require authentication
requireAuth();

try {
    // Get JSON input
    $input = getJsonInput();
    
    // Validate required fields
    if (!isset($input['task_id']) || empty($input['task_id'])) {
        sendResponse(false, null, 'Task ID is required', 400);
    }
    
    $userId = getCurrentUserId();
    $taskId = intval($input['task_id']);
    
    // Get database connection
    $db = getDBConnection();
    
    // Verify task exists and belongs to user
    $stmt = $db->prepare("SELECT task_id FROM tasks WHERE task_id = ? AND user_id = ?");
    $stmt->execute([$taskId, $userId]);
    
    if (!$stmt->fetch()) {
        sendResponse(false, null, 'Task not found or access denied', 404);
    }
    
    // Delete task (reminders will be deleted automatically due to CASCADE)
    $stmt = $db->prepare("DELETE FROM tasks WHERE task_id = ? AND user_id = ?");
    $stmt->execute([$taskId, $userId]);
    
    sendResponse(true, null, 'Task deleted successfully');
    
} catch (PDOException $e) {
    error_log("Delete task error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Delete task error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred while deleting task', 500);
}
?>
