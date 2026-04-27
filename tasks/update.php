<?php
/**
 * Update Task Endpoint
 * Updates an existing task for the authenticated user
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
    $required = ['task_id', 'title'];
    $validation = validateRequiredFields($input, $required);
    
    if ($validation !== true) {
        sendResponse(false, null, 'Missing required fields: ' . implode(', ', $validation), 400);
    }
    
    $userId = getCurrentUserId();
    $taskId = intval($input['task_id']);
    $title = sanitizeInput($input['title']);
    $description = isset($input['description']) ? sanitizeInput($input['description']) : null;
    $categoryId = isset($input['category_id']) && !empty($input['category_id']) ? intval($input['category_id']) : null;
    $priority = isset($input['priority']) ? $input['priority'] : 'Medium';
    $status = isset($input['status']) ? $input['status'] : 'Pending';
    $deadline = isset($input['deadline']) && !empty($input['deadline']) ? $input['deadline'] : null;
    
    // Validate priority
    if (!in_array($priority, ['Low', 'Medium', 'High'])) {
        sendResponse(false, null, 'Invalid priority value', 400);
    }
    
    // Validate status
    if (!in_array($status, ['Pending', 'In Progress', 'Completed'])) {
        sendResponse(false, null, 'Invalid status value', 400);
    }
    
    // Validate deadline if provided
    if ($deadline && !validateDate($deadline)) {
        sendResponse(false, null, 'Invalid deadline format. Use YYYY-MM-DD', 400);
    }
    
    // Get database connection
    $db = getDBConnection();
    
    // Verify task exists and belongs to user
    $stmt = $db->prepare("SELECT task_id, status FROM tasks WHERE task_id = ? AND user_id = ?");
    $stmt->execute([$taskId, $userId]);
    $existingTask = $stmt->fetch();
    
    if (!$existingTask) {
        sendResponse(false, null, 'Task not found or access denied', 404);
    }
    
    // If category_id is provided, verify it exists and belongs to user or is a system category
    if ($categoryId) {
        $stmt = $db->prepare("
            SELECT category_id FROM categories 
            WHERE category_id = ? AND (user_id = ? OR user_id IS NULL)
        ");
        $stmt->execute([$categoryId, $userId]);
        if (!$stmt->fetch()) {
            sendResponse(false, null, 'Invalid category', 400);
        }
    }
    
    // Determine completed_at timestamp
    $completedAt = null;
    if ($status === 'Completed' && $existingTask['status'] !== 'Completed') {
        // Task just completed
        $completedAt = date('Y-m-d H:i:s');
    } elseif ($status === 'Completed') {
        // Task was already completed, keep existing timestamp
        $stmt = $db->prepare("SELECT completed_at FROM tasks WHERE task_id = ?");
        $stmt->execute([$taskId]);
        $result = $stmt->fetch();
        $completedAt = $result['completed_at'];
    }
    
    // Update task
    $stmt = $db->prepare("
        UPDATE tasks 
        SET title = ?,
            description = ?,
            category_id = ?,
            priority = ?,
            status = ?,
            deadline = ?,
            completed_at = ?,
            updated_at = NOW()
        WHERE task_id = ? AND user_id = ?
    ");
    
    $stmt->execute([
        $title,
        $description,
        $categoryId,
        $priority,
        $status,
        $deadline,
        $completedAt,
        $taskId,
        $userId
    ]);
    
    // Retrieve the updated task with category info
    $stmt = $db->prepare("
        SELECT 
            t.*,
            c.category_name,
            c.category_color
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.category_id
        WHERE t.task_id = ?
    ");
    $stmt->execute([$taskId]);
    $task = $stmt->fetch();
    
    sendResponse(true, ['task' => $task], 'Task updated successfully');
    
} catch (PDOException $e) {
    error_log("Update task error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Update task error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred while updating task', 500);
}
?>
