<?php
/**
 * Read Tasks Endpoint
 * Retrieves all tasks for the authenticated user
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';

// Set CORS headers
setCorsHeaders();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, null, 'Invalid request method', 405);
}


// Require authentication
requireAuth();

try {
    $userId = getCurrentUserId();
    
    // Get database connection
    $db = getDBConnection();
    
    // Retrieve all tasks for user with category information
    $stmt = $db->prepare("
        SELECT 
            t.task_id,
            t.user_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.deadline,
            t.completed_at,
            t.created_at,
            t.updated_at,
            t.category_id,
            c.category_name,
            c.category_color
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.category_id
        WHERE t.user_id = ?
        ORDER BY 
            CASE 
                WHEN t.deadline IS NULL THEN 1
                ELSE 0
            END,
            t.deadline ASC,
            t.created_at DESC
    ");
    
    $stmt->execute([$userId]);
    $tasks = $stmt->fetchAll();
    
    sendResponse(true, $tasks, 'Tasks retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Read tasks error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Read tasks error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred while retrieving tasks', 500);
}
?>
