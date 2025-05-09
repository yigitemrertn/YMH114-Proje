<?php
require_once 'vendor/autoload.php';

use App\Database\Config;
use App\Database\Migrations\CreateUsersTable;
use App\Database\Migrations\CreateRememberTokensTable;

try {
    $pdo = Config::getInstance()->getPDO();
    
    // Create migrations table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Get executed migrations
    $stmt = $pdo->query("SELECT migration FROM migrations");
    $executed = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Define migrations to run
    $migrations = [
        new CreateUsersTable(),
        new CreateRememberTokensTable()
    ];
    
    // Run migrations
    foreach ($migrations as $migration) {
        $className = get_class($migration);
        if (!in_array($className, $executed)) {
            echo "Running migration: $className\n";
            $migration->up();
            
            $stmt = $pdo->prepare("INSERT INTO migrations (migration) VALUES (?)");
            $stmt->execute([$className]);
            
            echo "Migration completed: $className\n";
        }
    }
    
    echo "All migrations completed successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
} 