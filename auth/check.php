<?php
/**
 * Check Authentication Status
 * Returns whether user is logged in and their basic info
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/utils.php';


// Set CORS headers
setCorsHeaders();

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


try {
    // Check if user is logged in
    $isLoggedIn = isLoggedIn();
    $user = null;
    
    if ($isLoggedIn) {
        $userId = getCurrentUserId();
        
        // Get user info from database
        $db = getDBConnection();
        $stmt = $db->prepare("SELECT user_id, username, email, full_name FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    }
    
    sendResponse(true, [
        'isLoggedIn' => $isLoggedIn,
        'user' => $user
    ], 'Auth status retrieved');
    
} catch (Exception $e) {
    sendResponse(false, null, 'Error checking authentication', 500);
}
?>
