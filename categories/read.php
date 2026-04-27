<?php
/**
 * Read Categories Endpoint
 * Retrieves all categories (system + user's custom categories)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';

// Set CORS headers
setCorsHeaders();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, null, 'Invalid request method', 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


// Require authentication
requireAuth();

try {
    $userId = getCurrentUserId();
    
    // Get database connection
    $db = getDBConnection();
    
    // Retrieve all categories (system categories + user's custom categories)
    $stmt = $db->prepare("
        SELECT 
            category_id,
            category_name,
            category_color,
            user_id,
            created_at
        FROM categories
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY 
            CASE WHEN user_id IS NULL THEN 0 ELSE 1 END,
            category_name ASC
    ");
    
    $stmt->execute([$userId]);
    $categories = $stmt->fetchAll();
    
    sendResponse(true, $categories, 'Categories retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Read categories error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Read categories error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred while retrieving categories', 500);
}
?>
