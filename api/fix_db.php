<?php
// Run once: http://localhost/moverewards/api/fix_db.php
// Ye profile_pic column ko MEDIUMTEXT mein convert karega
header("Content-Type: text/html; charset=UTF-8");
require_once 'config.php';

echo "<h2>Database Fix Running...</h2>";

try {
    $db = getDB();
    
    // Fix profile_pic column - VARCHAR(255) se MEDIUMTEXT
    $db->exec("ALTER TABLE users MODIFY COLUMN profile_pic MEDIUMTEXT");
    echo "<p style='color:green'>✅ profile_pic column fixed (now MEDIUMTEXT - supports base64 images)</p>";
    
    // Verify
    $result = $db->query("SHOW COLUMNS FROM users LIKE 'profile_pic'")->fetch();
    echo "<p>Column type now: <b>" . $result['Type'] . "</b></p>";
    
    echo "<h3 style='color:green'>✅ Fix complete! Image upload will now work.</h3>";
    echo "<p><a href='http://localhost:3000'>Go back to app</a></p>";
    
} catch(Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}
