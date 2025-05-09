<?php
namespace App\Database\Migrations;

use App\Database\Migration;

class CreateRememberTokensTable extends Migration {
    public function up() {
        $columns = [
            'id INT AUTO_INCREMENT PRIMARY KEY',
            'user_id INT NOT NULL',
            'token VARCHAR(64) NOT NULL UNIQUE',
            'expires_at TIMESTAMP NOT NULL',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
        ];
        
        $this->createTable('remember_tokens', $columns);
    }
    
    public function down() {
        $this->dropTable('remember_tokens');
    }
} 