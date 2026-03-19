<?php
require_once 'config.php';
require_once 'email.php';
$action = $_GET['action'] ?? '';
$body   = getBody();

function fmtUser(array $u): array {
    return [
        'id'                   => $u['id'],
        'name'                 => $u['name'],
        'email'                => $u['email'],
        'role'                 => $u['role'],
        'status'               => $u['status'],
        'position'             => $u['position'] ?? 'Mover',
        'hireDate'             => $u['hire_date'] ?? '',
        'phone'                => $u['phone'] ?? '',
        'adminNotes'           => $u['admin_notes'] ?? '',
        'profilePic'           => $u['profile_pic'] ?? '',
        'notificationsEnabled' => (bool)($u['notifications_enabled'] ?? true),
        'createdAt'            => $u['created_at'] ?? '',
        'totalPoints'          => (int)($u['total_points'] ?? 0),
    ];
}

switch ($action) {
    case 'list':
        requireAdmin();
        $rows = getDB()->query("
            SELECT u.*, COALESCE(SUM(t.points),0) total_points
            FROM users u
            LEFT JOIN transactions t ON t.employee_id = u.id
            WHERE u.role='employee'
            GROUP BY u.id ORDER BY u.name
        ")->fetchAll();
        respond(array_map('fmtUser', $rows));
        break;

    case 'update_profile':
        $auth = requireAuth();
        $db = getDB();
        $f = []; $p = [];
        
        // Only update these fields (profilePic via upload.php)
        $map = [
            'name'                 => 'name',
            'phone'                => 'phone',
            'notificationsEnabled' => 'notifications_enabled',
        ];
        
        foreach ($map as $j => $d) {
            if (array_key_exists($j, $body)) {
                $f[] = "$d = ?";
                $p[] = $d === 'notifications_enabled' ? ($body[$j] ? 1 : 0) : $body[$j];
            }
        }
        
        if (empty($f)) respondError('No fields to update');
        
        $p[] = $auth['uid'];
        $db->prepare("UPDATE users SET " . implode(', ', $f) . " WHERE id = ?")->execute($p);
        
        $st = $db->prepare("SELECT * FROM users WHERE id = ?");
        $st->execute([$auth['uid']]);
        $u = $st->fetch();
        unset($u['password']);
        respond(fmtUser($u));
        break;

    case 'admin_create':
        requireAdmin(); $db = getDB();
        $name  = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        if (!$name || !$email) respondError('Name and email required');
        $ck = $db->prepare("SELECT id FROM users WHERE email = ?");
        $ck->execute([$email]);
        if ($ck->fetch()) respondError('Email already registered');
        $id = genId('u');
        $db->prepare("INSERT INTO users (id,name,email,password,role,status,position,hire_date,phone) VALUES (?,?,?,?,?,'active',?,?,?)")
           ->execute([$id, $name, $email,
                      password_hash($body['password'] ?? 'password123', PASSWORD_BCRYPT),
                      $body['role'] ?? 'employee',
                      $body['position'] ?? 'Mover',
                      $body['hireDate'] ?? date('Y-m-d'),
                      $body['phone'] ?? '']);
        respond(['message' => 'Employee created successfully', 'id' => $id]);
        break;

    case 'admin_update':
        requireAdmin();
        $id = $body['id'] ?? '';
        if (!$id) respondError('ID required');
        $db = getDB(); $f = []; $p = [];
        $allowed = ['name','email','position','phone','hire_date','admin_notes','status','role','notifications_enabled'];
        $map = ['hireDate'=>'hire_date','adminNotes'=>'admin_notes','notificationsEnabled'=>'notifications_enabled'];
        foreach ($body as $k => $v) {
            $dk = $map[$k] ?? $k;
            if (in_array($dk, $allowed) && $k !== 'id') {
                $f[] = "$dk = ?";
                $p[] = ($dk === 'notifications_enabled') ? ($v ? 1 : 0) : $v;
            }
        }
        if (!empty($body['password'])) {
            $f[] = "password = ?";
            $p[] = password_hash($body['password'], PASSWORD_BCRYPT);
        }
        if (empty($f)) respondError('No fields to update');
        $p[] = $id;
        $db->prepare("UPDATE users SET " . implode(', ', $f) . " WHERE id = ?")->execute($p);
        respond(['message' => 'Employee updated successfully']);
        break;

    case 'approve':
        requireAdmin();
        $id = $body['id'] ?? '';
        $db = getDB();
        $db->prepare("UPDATE users SET status='active' WHERE id=?")->execute([$id]);
        $empSt = $db->prepare("SELECT name, email FROM users WHERE id=?");
        $empSt->execute([$id]);
        $emp = $empSt->fetch();
        if ($emp) @emailAccountApproved($emp['name'], $emp['email']);
        respond(['message' => 'Account approved successfully']);
        break;

    case 'deactivate':
        requireAdmin();
        getDB()->prepare("UPDATE users SET status='deactivated' WHERE id=?")->execute([$body['id'] ?? '']);
        respond(['message' => 'Account deactivated']);
        break;

    case 'activate':
        requireAdmin();
        getDB()->prepare("UPDATE users SET status='active' WHERE id=?")->execute([$body['id'] ?? '']);
        respond(['message' => 'Account activated']);
        break;

    default:
        respondError('Invalid action', 404);
}
