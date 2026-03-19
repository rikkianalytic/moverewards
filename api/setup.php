<?php
// ================================================
// SETUP.PHP - Ek baar chalao, sab theek ho jayega
// Browser mein kholo: http://localhost/moverewards/api/setup.php
// ================================================

define('DB_HOST', 'localhost');
define('DB_USER', 'rikide5_moverewards_db');
define('DB_PASS', 'y4HQTe&6xfxx');
define('DB_NAME', 'rikide5_moverewards_db');

header('Content-Type: text/html; charset=UTF-8');

$log = [];

function logMsg($msg, $ok = true) {
    global $log;
    $log[] = ['msg' => $msg, 'ok' => $ok];
    echo ($ok ? '✅' : '❌') . " $msg<br>\n";
    flush();
}

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'>
<title>MoveRewards Setup</title>
<style>
body{font-family:Arial;padding:30px;background:#f0f4f8;max-width:700px;margin:auto}
h1{color:#1E40AF}
.box{background:white;padding:20px;border-radius:10px;margin:15px 0;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.ok{color:green} .err{color:red}
.creds{background:#dbeafe;padding:15px;border-radius:8px;font-size:18px;margin-top:20px}
</style></head><body>
<h1>🔧 MoveRewards Setup</h1>
<div class='box'>\n";

try {
    // 1. Connect to MySQL
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    logMsg("MySQL connection successful");

    // 2. Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `" . DB_NAME . "`");
    logMsg("Database '" . DB_NAME . "' ready");

    // 3. Create all tables
    $tables = [
        "users" => "CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin','employee') DEFAULT 'employee',
            status ENUM('pending','active','deactivated') DEFAULT 'pending',
            position ENUM('Mover','Driver','Crew Lead') DEFAULT 'Mover',
            hire_date DATE,
            phone VARCHAR(20),
            admin_notes TEXT,
            profile_pic VARCHAR(255),
            notifications_enabled TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "transactions" => "CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            employee_id VARCHAR(50) NOT NULL,
            employee_name VARCHAR(100) NOT NULL,
            points INT NOT NULL,
            category VARCHAR(100) NOT NULL,
            notes TEXT,
            admin_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "rewards" => "CREATE TABLE IF NOT EXISTS rewards (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            points_required INT NOT NULL,
            status ENUM('active','inactive') DEFAULT 'active',
            coupon_code VARCHAR(100),
            how_to_use TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "redemptions" => "CREATE TABLE IF NOT EXISTS redemptions (
            id VARCHAR(50) PRIMARY KEY,
            employee_id VARCHAR(50) NOT NULL,
            employee_name VARCHAR(100) NOT NULL,
            reward_id VARCHAR(50) NOT NULL,
            reward_name VARCHAR(100) NOT NULL,
            points_value INT NOT NULL,
            status ENUM('pending','approved','denied') DEFAULT 'pending',
            date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_approved TIMESTAMP NULL,
            FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "contests" => "CREATE TABLE IF NOT EXISTS contests (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            criteria_type ENUM('points','category_count') DEFAULT 'points',
            category_filter VARCHAR(100),
            prize_type ENUM('points','reward') DEFAULT 'points',
            prize_value INT DEFAULT 0,
            assigned_employee_ids JSON,
            status ENUM('active','completed') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "point_requests" => "CREATE TABLE IF NOT EXISTS point_requests (
            id VARCHAR(50) PRIMARY KEY,
            employee_id VARCHAR(50) NOT NULL,
            employee_name VARCHAR(100) NOT NULL,
            points INT NOT NULL,
            category VARCHAR(100) NOT NULL,
            notes TEXT,
            status ENUM('pending','approved','declined') DEFAULT 'pending',
            processed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "categories" => "CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "notes" => "CREATE TABLE IF NOT EXISTS notes (
            id VARCHAR(50) PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT,
            type ENUM('note','idea') DEFAULT 'note',
            is_public TINYINT(1) DEFAULT 0,
            color VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];

    foreach ($tables as $name => $sql) {
        $pdo->exec($sql);
        logMsg("Table '$name' created/verified");
    }

    // 4. Generate CORRECT password hashes using PHP
    $adminPass = password_hash('password123', PASSWORD_BCRYPT);
    $empPass   = password_hash('password123', PASSWORD_BCRYPT);

    // 5. Insert/Update users with CORRECT hash
    // Delete old users first to fix hash problem
    $pdo->exec("DELETE FROM users WHERE id IN ('admin-1', 'emp-1')");
    
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status, position, hire_date, phone) 
                           VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)");
    
    $stmt->execute(['admin-1', 'Admin Joe', 'admin@move.com', $adminPass, 'admin', 'Crew Lead', '2020-01-01', '555-0100']);
    logMsg("Admin user created (admin@move.com / password123)");
    
    $stmt->execute(['emp-1', 'Sarah Mover', 'sarah@move.com', $empPass, 'employee', 'Mover', '2023-05-12', '555-0101']);
    logMsg("Employee user created (sarah@move.com / password123)");

    // 6. Default categories
    $cats = ['Safety Excellence','Customer Review (5 Star)','On-Time Arrival',
             'Equipment Maintenance','Leadership','Extra Mile',
             'Damaged Claim Penalty','Uniform Violation'];
    $catStmt = $pdo->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
    foreach ($cats as $cat) $catStmt->execute([$cat]);
    logMsg("Default categories inserted (8)");

    // 7. Default rewards
    $pdo->exec("DELETE FROM rewards WHERE id IN ('r-1','r-2','r-3','r-4')");
    $rwStmt = $pdo->prepare("INSERT INTO rewards (id, name, description, points_required, status) VALUES (?,?,?,?,?)");
    $rwStmt->execute(['r-1', '$50 Fuel Card', 'Visa/Shell Fuel Card', 500, 'active']);
    $rwStmt->execute(['r-2', 'Paid Half-Day Off', '4 hours of PTO', 1500, 'active']);
    $rwStmt->execute(['r-3', 'MoveRewards Branded Hoodie', 'Premium quality gear', 800, 'active']);
    $rwStmt->execute(['r-4', '$100 Amazon Gift Card', 'Digital gift card', 1000, 'active']);
    logMsg("Default rewards inserted (4)");

    // Verify login works
    $check = $pdo->prepare("SELECT password FROM users WHERE email = 'admin@move.com'");
    $check->execute();
    $row = $check->fetch(PDO::FETCH_ASSOC);
    $works = password_verify('password123', $row['password']);
    logMsg("Password verification test: " . ($works ? "PASSED ✓" : "FAILED ✗"), $works);

    echo "</div>";
    echo "<div class='box'>";
    echo "<h2 class='ok'>✅ Setup Complete!</h2>";
    echo "<div class='creds'>";
    echo "<b>Login Credentials:</b><br><br>";
    echo "🔑 <b>Admin:</b> admin@move.com &nbsp;|&nbsp; password: <code>password123</code><br>";
    echo "👤 <b>Employee:</b> sarah@move.com &nbsp;|&nbsp; password: <code>password123</code>";
    echo "</div>";
    echo "<br><p style='color:gray'>Ab <a href='http://localhost:3000'>localhost:3000</a> pe jao aur login karo.</p>";
    echo "</div>";

} catch (Exception $e) {
    logMsg("ERROR: " . $e->getMessage(), false);
    echo "</div>";
    echo "<div class='box' style='border:2px solid red'>";
    echo "<h3 style='color:red'>❌ Setup Failed</h3>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Check kar: XAMPP MySQL running hai? Username/password sahi hai?</p>";
    echo "</div>";
}

echo "</body></html>";
