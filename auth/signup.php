<?php
/**
 * User Signup Endpoint
 * Creates new user account
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
    $required = ['username', 'email', 'password'];
    $validation = validateRequiredFields($input, $required);
    
    if ($validation !== true) {
        sendResponse(false, null, 'Missing required fields: ' . implode(', ', $validation), 400);
    }
    
    $username = sanitizeInput($input['username']);
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    $fullName = isset($input['full_name']) ? sanitizeInput($input['full_name']) : null;
    
    // Validate email format
    if (!validateEmail($email)) {
        sendResponse(false, null, 'Invalid email format', 400);
    }
    
    // Validate username length
    if (strlen($username) < 3 || strlen($username) > 50) {
        sendResponse(false, null, 'Username must be between 3 and 50 characters', 400);
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        sendResponse(false, null, 'Password must be at least 6 characters long', 400);
    }
    
    // Get database connection
    $db = getDBConnection();
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendResponse(false, null, 'Email already registered', 409);
    }
    
    // Check if username already exists
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendResponse(false, null, 'Username already taken', 409);
    }
    
    // Hash password
    $hashedPassword = hashPassword($password);
    
    // Insert new user
    $stmt = $db->prepare("
        INSERT INTO users (username, email, password, full_name) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$username, $email, $hashedPassword, $fullName]);
    
    // Get the new user ID
    $userId = $db->lastInsertId();
    
    // Auto-login after signup
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['logged_in'] = true;
    
    // Return user data
    $user = [
        'user_id' => $userId,
        'username' => $username,
        'email' => $email,
        'full_name' => $fullName
    ];
    
    sendResponse(true, [
        'user' => $user
    ], 'Account created successfully');
    
} catch (PDOException $e) {
    error_log("Signup error: " . $e->getMessage());
    
    // Check for duplicate key error
    if ($e->getCode() == 23000) {
        sendResponse(false, null, 'Email or username already exists', 409);
    }
    
    sendResponse(false, null, 'Database error occurred', 500);
} catch (Exception $e) {
    error_log("Signup error: " . $e->getMessage());
    sendResponse(false, null, 'An error occurred during signup', 500);
}
?>
