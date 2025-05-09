<?php
namespace App\Security;

class Security {
    public static function generateCSRFToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public static function validateInput($data, $rules) {
        $errors = [];
        foreach ($rules as $field => $rule) {
            if (!isset($data[$field]) || !self::validateField($data[$field], $rule)) {
                $errors[$field] = "Invalid $field";
            }
        }
        return $errors;
    }
    
    private static function validateField($value, $rule) {
        switch ($rule) {
            case 'email':
                return filter_var($value, FILTER_VALIDATE_EMAIL);
            case 'required':
                return !empty($value);
            case 'numeric':
                return is_numeric($value);
            default:
                return true;
        }
    }
    
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
} 