<?php
namespace App\Database;

abstract class Migration {
    protected $pdo;
    
    public function __construct() {
        $this->pdo = Config::getInstance()->getPDO();
    }
    
    abstract public function up();
    abstract public function down();
    
    protected function createTable($tableName, $columns) {
        $sql = "CREATE TABLE IF NOT EXISTS $tableName (";
        $sql .= implode(', ', $columns);
        $sql .= ")";
        
        $this->pdo->exec($sql);
    }
    
    protected function dropTable($tableName) {
        $this->pdo->exec("DROP TABLE IF EXISTS $tableName");
    }
    
    protected function addColumn($tableName, $columnName, $definition) {
        $this->pdo->exec("ALTER TABLE $tableName ADD COLUMN $columnName $definition");
    }
    
    protected function dropColumn($tableName, $columnName) {
        $this->pdo->exec("ALTER TABLE $tableName DROP COLUMN $columnName");
    }
}