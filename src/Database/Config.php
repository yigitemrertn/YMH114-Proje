<?php
namespace App\Database;

class Config {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        $host = 'localhost';
        $dbname = 'ForumDB';
        $username = 'root';
        $password = '';
        
        try {
            error_log("Attempting to connect to database: ForumDB on localhost");
            $this->pdo = new \PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    \PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
            error_log("Database connection successful");
        } catch(\PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getPDO() {
        return $this->pdo;
    }
} 