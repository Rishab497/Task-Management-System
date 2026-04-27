<?php
/**
 * User Login Endpoint
 * Authenticates user and creates session
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


try {
    // Get JSON input
    $input = getJsonInput();
    
    // Validate required fields
    $required = ['email', 'password'];
    $validation = validateRequiredFields($input, $required);
    
    if ($validation !== true) {
        sendResponse(false, null, 'Missing required fields: ' . implode(', ', $validation), 400);
    }
    
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    
    // Validate email format
    if (!validateEmail($email)) {
        sendResponse(false, null, 'Invalid email format', 400);
    }
    
    // Get database connection
    $db = getDBConnection();
    
    // Find user by email
    $stmt = $db->prepare("
        SELECT user_id, username, email, password, full_name, is_active 
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    // Check if user exists
    if (!$user) {
        sendResponse(false, null, 'Invalid email or password', 401);
    }
    
    // Check if account is active
    if ($user['is_active'] != 1) {
        sendResponse(false, null, 'Account is suspended. Please contact support.', 403);
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password'])) {
        sendResponse(false, null, 'Invalid email or password', 401);
    }
    
    // Login successful - create session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['logged_in'] = true;
    
    // Update last login time
    $updateStmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $updateStmt->execute([$user['user_id']]);
    
    // Return user data (without password)
    unset($user['password']);
    unset($user['is_active']);
    
    sendResponse(true, [
        'user' => $user,
        'message' => 'Login successful'
    ], 'Login successful');
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred during login', 500);
}
?>
