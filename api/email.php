<?php
// email.php - Email notification helper
// Uses PHP mail() - for production use PHPMailer/SMTP

function sendEmail(string $to, string $subject, string $htmlBody): bool {
    $from = 'noreply@moverewards.com';
    $headers = implode("\r\n", [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: MoveRewards <$from>",
        "Reply-To: $from",
        "X-Mailer: PHP/" . PHP_VERSION
    ]);
    return mail($to, $subject, $htmlBody, $headers);
}

function emailTemplate(string $title, string $content, string $btnText = '', string $btnLink = ''): string {
    $btn = $btnText ? "<a href='$btnLink' style='display:inline-block;background:#1E40AF;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px'>$btnText</a>" : '';
    return "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif'>
  <div style='max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)'>
    <div style='background:#1E40AF;padding:30px 40px;text-align:center'>
      <h1 style='color:white;margin:0;font-size:24px;font-weight:900'>🏆 MoveRewards</h1>
      <p style='color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px'>Performance Recognition Platform</p>
    </div>
    <div style='padding:40px'>
      <h2 style='color:#0f172a;font-size:22px;font-weight:800;margin:0 0 16px'>$title</h2>
      <div style='color:#475569;font-size:15px;line-height:1.7'>$content</div>
      $btn
    </div>
    <div style='background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0'>
      <p style='color:#94a3b8;font-size:12px;margin:0'>© " . date('Y') . " MoveRewards. Internal Use Only.</p>
    </div>
  </div>
</body>
</html>";
}

// Email Templates
function emailPointsAwarded(string $empName, string $empEmail, int $points, string $category, string $notes = ''): void {
    $noteText = $notes ? "<br><br><em>Note: \"$notes\"</em>" : '';
    sendEmail($empEmail, "🎉 You earned $points points!", emailTemplate(
        "You've earned points, $empName!",
        "Great work! You've been awarded <strong>$points points</strong> in the <strong>$category</strong> category.$noteText<br><br>Keep up the excellent performance!"
    ));
}

function emailRewardApproved(string $empName, string $empEmail, string $rewardName, string $couponCode = ''): void {
    $codeText = $couponCode ? "<br><br>Your coupon code: <strong style='font-size:18px;color:#1E40AF;letter-spacing:2px'>$couponCode</strong>" : '';
    sendEmail($empEmail, "✅ Your reward is ready!", emailTemplate(
        "Reward Approved: $rewardName",
        "Congratulations $empName! Your redemption for <strong>$rewardName</strong> has been approved.$codeText<br><br>Log in to your vault to access your reward.",
        'Open Vault', 'http://localhost:3000/#/employee/redemptions'
    ));
}

function emailAccountApproved(string $empName, string $empEmail): void {
    sendEmail($empEmail, "✅ Your MoveRewards account is active!", emailTemplate(
        "Welcome to MoveRewards, $empName!",
        "Your account has been approved by an admin. You can now log in and start earning points!",
        'Login Now', 'http://localhost:3000/#/login'
    ));
}

function emailContestInvite(string $empName, string $empEmail, string $contestName, string $endDate, int $prize): void {
    sendEmail($empEmail, "🏆 You're invited to: $contestName", emailTemplate(
        "Contest Invitation: $contestName",
        "Hi $empName! You've been invited to participate in the <strong>$contestName</strong> contest.<br><br>
        Prize: <strong>$prize points</strong><br>
        Ends: <strong>$endDate</strong><br><br>
        Start earning points now to climb the leaderboard!",
        'View Contest', 'http://localhost:3000/#/employee/contests'
    ));
}

function emailPointRequestProcessed(string $empName, string $empEmail, int $points, string $category, string $status): void {
    $isApproved = $status === 'approved';
    sendEmail($empEmail, $isApproved ? "✅ Point request approved!" : "❌ Point request declined", emailTemplate(
        $isApproved ? "Points Approved!" : "Request Declined",
        $isApproved
            ? "Your request for <strong>$points points</strong> in <strong>$category</strong> has been approved and added to your balance!"
            : "Your request for <strong>$points points</strong> in <strong>$category</strong> was declined by an admin. Please contact your manager for more information."
    ));
}
