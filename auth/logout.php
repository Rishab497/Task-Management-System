<?php
/**
 * User Logout Endpoint
 * Destroys user session
 */

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


try {
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy the session
    session_destroy();
    
    sendResponse(true, null, 'Logged out successfully');
    
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred during logout', 500);
}
?>
