<?php
/**
 * Create Task Endpoint
 * Creates a new task for the authenticated user
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';

// Set CORS headers
setCorsHeaders();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Invalid request method', 405);
}



// Require authentication
requireAuth();

try {
    // Get JSON input
    $input = getJsonInput();
    
    // Validate required fields
    $required = ['title'];
    $validation = validateRequiredFields($input, $required);
    
    if ($validation !== true) {
        sendResponse(false, null, 'Task title is required', 400);
    }
    
    $userId = getCurrentUserId();
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
    
    // Insert task
    $stmt = $db->prepare("
        INSERT INTO tasks (user_id, title, description, category_id, priority, status, deadline) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $userId,
        $title,
        $description,
        $categoryId,
        $priority,
        $status,
        $deadline
    ]);
    
    // Get the new task ID
    $taskId = $db->lastInsertId();
    
    // Retrieve the created task with category info
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
    
    sendResponse(true, ['task' => $task], 'Task created successfully');
    
} catch (PDOException $e) {
    error_log("Create task error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Create task error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred while creating task', 500);
}
?>
