<?php

namespace App\Config;

use Monolog\Logger as MonologLogger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\LineFormatter;

class Logger
{
    private static $instance = null;
    private $logger;

    private function __construct()
    {
        $this->logger = new MonologLogger('app');
        
        // Console handler for development
        $consoleHandler = new StreamHandler('php://stdout', MonologLogger::DEBUG);
        $consoleHandler->setFormatter(new LineFormatter(
            "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n",
            "Y-m-d H:i:s"
        ));
        $this->logger->pushHandler($consoleHandler);
        
        // File handler for production
        $fileHandler = new RotatingFileHandler(
            __DIR__ . '/../../logs/app.log',
            30, // Keep 30 days of logs
            MonologLogger::INFO
        );
        $fileHandler->setFormatter(new LineFormatter(
            "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n",
            "Y-m-d H:i:s"
        ));
        $this->logger->pushHandler($fileHandler);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getLogger(): MonologLogger
    {
        return $this->logger;
    }

    public function emergency($message, array $context = []): void
    {
        $this->logger->emergency($message, $context);
    }

    public function alert($message, array $context = []): void
    {
        $this->logger->alert($message, $context);
    }

    public function critical($message, array $context = []): void
    {
        $this->logger->critical($message, $context);
    }

    public function error($message, array $context = []): void
    {
        $this->logger->error($message, $context);
    }

    public function warning($message, array $context = []): void
    {
        $this->logger->warning($message, $context);
    }

    public function notice($message, array $context = []): void
    {
        $this->logger->notice($message, $context);
    }

    public function info($message, array $context = []): void
    {
        $this->logger->info($message, $context);
    }

    public function debug($message, array $context = []): void
    {
        $this->logger->debug($message, $context);
    }
} 