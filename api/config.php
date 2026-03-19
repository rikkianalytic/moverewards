<?php
// ========== CORS FIX ==========
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    die();
}
// ==============================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'moverewards');
define('JWT_SECRET', 'moverewards_secret_key_xyz_2024');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    }
    return $pdo;
}
function respond($data, int $code = 200): void { http_response_code($code); echo json_encode($data); exit(); }
function respondError(string $msg, int $code = 400): void { respond(['error' => $msg], $code); }
function getBody(): array { return json_decode(file_get_contents('php://input'), true) ?? []; }
function genId(string $p = 'id'): string { return $p.'-'.bin2hex(random_bytes(6)); }
function b64url_encode(string $d): string { return rtrim(strtr(base64_encode($d),'+/','-_'),'='); }
function b64url_decode(string $d): string { return base64_decode(strtr($d,'-_','+/').str_repeat('=',(4-strlen($d)%4)%4)); }
function makeToken(string $uid, string $role): string {
    $h=b64url_encode(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $p=b64url_encode(json_encode(['uid'=>$uid,'role'=>$role,'exp'=>time()+86400]));
    $s=b64url_encode(hash_hmac('sha256',"$h.$p",JWT_SECRET,true));
    return "$h.$p.$s";
}
function readToken(string $token): ?array {
    $parts=explode('.',trim($token));
    if(count($parts)!==3) return null;
    [$h,$p,$s]=$parts;
    if(!hash_equals(b64url_encode(hash_hmac('sha256',"$h.$p",JWT_SECRET,true)),$s)) return null;
    $data=json_decode(b64url_decode($p),true);
    return(!$data||$data['exp']<time())?null:$data;
}
function getBearerToken(): string {
    if(!empty($_SERVER['HTTP_AUTHORIZATION'])) return str_replace('Bearer ','',$_SERVER['HTTP_AUTHORIZATION']);
    if(!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return str_replace('Bearer ','',$_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    if(function_exists('getallheaders')) foreach(getallheaders() as $k=>$v) if(strtolower($k)==='authorization') return str_replace('Bearer ','',$v);
    return '';
}
function requireAuth(): array {
    $d=readToken(getBearerToken());
    if(!$d) respondError('Unauthorized',401);
    return $d;
}
function requireAdmin(): array {
    $d=requireAuth();
    if($d['role']!=='admin') respondError('Forbidden',403);
    return $d;
}