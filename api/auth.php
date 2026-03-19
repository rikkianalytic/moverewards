<?php
require_once 'config.php';
$action = $_GET['action'] ?? '';
$body   = getBody();

switch ($action) {
    case 'login':
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        if (!$email || !$password) respondError('Email aur password chahiye');

        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user)                                          respondError('Email ya password galat hai', 401);
        if (!password_verify($password, $user['password'])) respondError('Email ya password galat hai', 401);
        if ($user['status'] === 'pending')                  respondError('Account approval pending hai');
        if ($user['status'] === 'deactivated')              respondError('Account deactivated hai');

        $token = makeToken($user['id'], $user['role']);
        unset($user['password']);
        respond(['user' => fmtUser($user), 'token' => $token]);
        break;

    case 'signup':
        $name     = trim($body['name'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? 'password123';
        if (!$name || !$email) respondError('Name aur email chahiye');

        $db = getDB();
        $ck = $db->prepare("SELECT id FROM users WHERE email = ?");
        $ck->execute([$email]);
        if ($ck->fetch()) respondError('Email already registered hai');

        $id = genId('u');
        $db->prepare("INSERT INTO users (id,name,email,password,role,status,position,hire_date,phone) VALUES (?,?,?,?,'employee','pending',?,NOW(),?)")
           ->execute([$id, $name, $email, password_hash($password, PASSWORD_BCRYPT),
                      $body['position'] ?? 'Mover', $body['phone'] ?? '']);
        respond(['message' => 'Account bana. Admin approval ka wait karo.', 'id' => $id]);
        break;

    case 'reset_password':
        $email   = trim($body['email'] ?? '');
        $newPass = $body['newPassword'] ?? '';
        if (!$email || !$newPass) respondError('Email aur newPassword chahiye');

        $db = getDB();
        $st = $db->prepare("SELECT id FROM users WHERE email = ?");
        $st->execute([$email]);
        if (!$st->fetch()) respondError('Email nahi mila');

        $db->prepare("UPDATE users SET password=? WHERE email=?")
           ->execute([password_hash($newPass, PASSWORD_BCRYPT), $email]);
        respond(['message' => 'Password reset ho gaya']);
        break;

    case 'update_password':
        $auth    = requireAuth();
        $newPass = $body['newPassword'] ?? '';
        if (strlen($newPass) < 6) respondError('Password 6+ characters ka hona chahiye');
        getDB()->prepare("UPDATE users SET password=? WHERE id=?")
               ->execute([password_hash($newPass, PASSWORD_BCRYPT), $auth['uid']]);
        respond(['message' => 'Password update ho gaya']);
        break;

    default:
        respondError('Invalid action', 404);
}

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
    ];
}
