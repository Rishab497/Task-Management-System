<?php
/**
 * Database Configuration File
 * 
 * This file establishes connection to MySQL database using PDO
 * PDO (PHP Data Objects) provides a secure, consistent interface for database access
 * 
 * Why PDO?
 * - Supports prepared statements (prevents SQL injection)
 * - Works with multiple database types
 * - Better error handling
 * - More secure than mysqli
 */

// Database credentials
define('DB_HOST', 'localhost');        // XAMPP MySQL runs on localhost
define('DB_NAME', 'task_manager_db');  // Database name we created
define('DB_USER', 'root');             // Default XAMPP MySQL username
define('DB_PASS', '');                 // Default XAMPP has no password

// Character set - UTF-8 supports all languages and emojis
define('DB_CHARSET', 'utf8mb4');

/**
 * Create database connection
 * 
 * @return PDO Database connection object
 * @throws PDOException if connection fails
 */
function getDBConnection() {
    try {
        // DSN (Data Source Name) - connection string
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        // PDO options for security and performance
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // Throw exceptions on errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // Return associative arrays
            PDO::ATTR_EMULATE_PREPARES   => false,                   // Use real prepared statements
            PDO::ATTR_PERSISTENT         => false                     // Don't reuse connections (safer for shared hosting)
        ];
        
        // Create PDO instance
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $pdo;
        
    } catch (PDOException $e) {
        // Log error securely (in production, log to file instead of displaying)
        error_log("Database Connection Error: " . $e->getMessage());
        
        // User-friendly error message (don't expose technical details in production)
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed. Please try again later.'
        ]));
    }
}

/**
 * Test database connection
 * Uncomment the lines below to test if database connects successfully
 */
// $db = getDBConnection();
// echo "Database connected successfully!";
?>
