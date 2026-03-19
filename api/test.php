<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Test JWT
require_once 'config.php';
$token = makeToken('test-user', 'admin');
$decoded = readToken($token);

echo json_encode([
    'status'      => 'API Working ✓',
    'cors'        => 'OK ✓',
    'jwt_create'  => !empty($token) ? 'OK ✓' : 'FAIL ✗',
    'jwt_verify'  => $decoded ? 'OK ✓' : 'FAIL ✗',
    'jwt_uid'     => $decoded['uid'] ?? 'null',
    'php_version' => PHP_VERSION,
    'time'        => date('Y-m-d H:i:s'),
    'token_sample'=> substr($token, 0, 30) . '...',
]);
