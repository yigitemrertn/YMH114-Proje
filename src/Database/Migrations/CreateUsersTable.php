<?php
namespace App\Database\Migrations;

use App\Database\Migration;

class CreateUsersTable extends Migration {
    public function up() {
        $columns = [
            'id INT AUTO_INCREMENT PRIMARY KEY',
            'username VARCHAR(50) NOT NULL UNIQUE',
            'email VARCHAR(100) NOT NULL UNIQUE',
            'password VARCHAR(255) NOT NULL',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ];
        
        $this->createTable('users', $columns);
    }
    
    public function down() {
        $this->dropTable('users');
    }
} 