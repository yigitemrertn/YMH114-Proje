<?php
namespace App\Auth;

use App\Config\Config;

class Auth {
    private $pdo;

    public function __construct() {
        $this->pdo = Config::getInstance()->getPDO();
    }

    public function login($email, $password, $rememberMe = false) {
        try {
            error_log("Attempting to find user with email: " . $email);
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                error_log("No user found with email: " . $email);
                return false;
            }

            error_log("User found, verifying password");
            if (password_verify($password, $user['password'])) {
                error_log("Password verified successfully");
                $this->setSession($user);
                if ($rememberMe) {
                    error_log("Setting remember token for user");
                    $this->setRememberToken($user['id']);
                }
                return true;
            }
            error_log("Password verification failed");
            return false;
        } catch (\PDOException $e) {
            error_log("Database error during login: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            throw new \Exception("Login failed: " . $e->getMessage());
        } catch (\Exception $e) {
            error_log("General error during login: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            throw $e;
        }
    }

    private function setSession($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['username'] = $user['username'];
        if (isset($user['name'])) $_SESSION['name'] = $user['name'];
        if (isset($user['surname'])) $_SESSION['surname'] = $user['surname'];
        session_regenerate_id(true);
    }

    private function setRememberToken($userId) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));

        $stmt = $this->pdo->prepare("INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $token, $expires]);

        $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
        setcookie('remember_token', $token, strtotime('+30 days'), '/', '', $secure, true);
    }

    public function logout() {
        session_destroy();
        if (isset($_COOKIE['remember_token'])) {
            $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
            setcookie('remember_token', '', time() - 3600, '/', '', $secure, true);
        }
    }

    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    }
}
