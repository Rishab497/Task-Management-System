<?php
/**
 * Create Category Endpoint (Optimized)
 * Supports system + custom category conflict detection
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';

// Set CORS headers
setCorsHeaders();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Invalid request method', 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Require authentication
requireAuth();

try {
    // Get JSON body
    $input = getJsonInput();

    // Validate input
    if (!isset($input['category_name']) || empty(trim($input['category_name']))) {
        sendResponse(false, null, 'Category name is required', 400);
    }

    $categoryName = sanitizeInput(trim($input['category_name']));
    $categoryColor = isset($input['category_color']) 
                      ? sanitizeInput($input['category_color']) 
                      : '#3498db';

    // Length validation
    if (strlen($categoryName) < 2 || strlen($categoryName) > 50) {
        sendResponse(false, null, 'Category name must be between 2 and 50 characters', 400);
    }

    // Validate hex color
    if (!preg_match('/^#[a-fA-F0-9]{6}$/', $categoryColor)) {
        $categoryColor = '#3498db';
    }

    // Get user ID
    $userId = getCurrentUserId();

    // DB connection
    $db = getDBConnection();

    // ✨ FIX: Check duplicate across BOTH system & user categories
    $stmt = $db->prepare("
    SELECT category_id FROM categories 
    WHERE category_name = ? 
    AND (user_id = ? OR user_id IS NULL)
");
$stmt->execute([$categoryName, $userId]);


    if ($stmt->fetch()) {
        sendResponse(false, null, 'Category name already exists', 409);
    }

    // Insert new category
    $insert = $db->prepare("
        INSERT INTO categories (category_name, category_color, user_id)
        VALUES (?, ?, ?)
    ");

    $insert->execute([$categoryName, $categoryColor, $userId]);

    $newId = $db->lastInsertId();

    // Fetch newly created category
    $fetch = $db->prepare("SELECT * FROM categories WHERE category_id = ?");
    $fetch->execute([$newId]);

    $category = $fetch->fetch(PDO::FETCH_ASSOC);

    sendResponse(true, ['category' => $category], 'Category created successfully', 201);

} catch (PDOException $e) {

    error_log("Category Creation PDO Error: " . $e->getMessage());

    // Duplicate key fallback
    if ($e->getCode() == 23000) {
        sendResponse(false, null, 'Category name already exists', 409);
    }

    sendResponse(false, null, 'Database error occurred', 500);

} catch (Exception $e) {
    error_log("Category Creation Error: " . $e->getMessage());
    sendResponse(false, null, 'An unexpected error occurred', 500);
}
?>
