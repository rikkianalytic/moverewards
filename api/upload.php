<?php
require_once 'config.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('POST method required', 405);
}

$auth = requireAuth();

// Check file exists
if (empty($_FILES['image'])) {
    respondError('No image file uploaded');
}

$file = $_FILES['image'];

// Validate file type
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo   = finfo_open(FILEINFO_MIME_TYPE);
$mime    = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    respondError('Only JPG, PNG, GIF, WEBP allowed');
}

// Max 2MB
if ($file['size'] > 2 * 1024 * 1024) {
    respondError('File too large. Max 2MB allowed.');
}

// Create uploads folder
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Unique filename
$ext      = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    default      => 'jpg'
};
$filename = 'profile_' . $auth['uid'] . '_' . time() . '.' . $ext;
$destPath = $uploadDir . $filename;

// Delete old profile pic if exists
$db = getDB();
$st = $db->prepare("SELECT profile_pic FROM users WHERE id = ?");
$st->execute([$auth['uid']]);
$old = $st->fetchColumn();
if ($old && strpos($old, '/api/uploads/') !== false) {
    $oldFile = __DIR__ . '/uploads/' . basename($old);
    if (file_exists($oldFile)) unlink($oldFile);
}

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    respondError('Failed to save file. Check folder permissions.');
}

// Save URL to database
$imageUrl = '/api/uploads/' . $filename;
$db->prepare("UPDATE users SET profile_pic = ? WHERE id = ?")
   ->execute([$imageUrl, $auth['uid']]);

respond(['url' => $imageUrl, 'message' => 'Image uploaded successfully']);
