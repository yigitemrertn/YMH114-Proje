# Forum Application

A PHP-based forum application with user authentication and database management.

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forum-application
```

2. Install dependencies:
```bash
composer install
```

3. Create a `.env` file in the root directory with the following content:
```
DB_HOST=localhost
DB_NAME=forum
DB_USER=your_database_user
DB_PASS=your_database_password

APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

SESSION_LIFETIME=120
REMEMBER_TOKEN_LIFETIME=43200
```

4. Create the database:
```bash
mysql -u root -p
CREATE DATABASE forum;
```

5. Run the migrations:
```bash
php migrate.php
```

## Project Structure

```
├── src/
│   ├── Auth/
│   │   └── Auth.php
│   ├── Config/
│   │   ├── Config.php
│   │   └── Logger.php
│   ├── Database/
│   │   ├── Migration.php
│   │   └── Migrations/
│   └── Security/
│       └── Security.php
├── logs/
├── public/
│   ├── index.php
│   ├── login.php
│   ├── register.php
│   └── logout.php
├── bootstrap.php
├── composer.json
├── migrate.php
└── README.md
```

## Features

- User authentication (login, register, logout)
- Remember me functionality
- CSRF protection
- Input validation and sanitization
- Secure password hashing
- Database migrations
- Logging system
- Error handling

## Security

- Passwords are hashed using PHP's password_hash()
- CSRF tokens are used for form submissions
- Input is validated and sanitized
- Prepared statements are used for database queries
- Session management with secure settings
- Remember me tokens are securely stored

## Development

To start the development server:
```bash
php -S localhost:8000 -t public
```

## License

MIT