<?php
require_once 'config.php';
$action=$_GET['action']??'';
function fTx($t){return['id'=>$t['id'],'employeeId'=>$t['employee_id'],'employeeName'=>$t['employee_name'],'points'=>(int)$t['points'],'category'=>$t['category'],'notes'=>$t['notes']??'','adminId'=>$t['admin_id'],'createdAt'=>$t['created_at']];}
switch($action){
    case 'admin_stats':
        requireAdmin(); $db=getDB();
        respond(['totalEmployees'=>(int)$db->query("SELECT COUNT(*) FROM users WHERE role='employee' AND status='active'")->fetchColumn(),'pendingApprovals'=>(int)$db->query("SELECT COUNT(*) FROM users WHERE role='employee' AND status='pending'")->fetchColumn(),'totalPointsIssued'=>(int)$db->query("SELECT COALESCE(SUM(points),0) FROM transactions WHERE points>0")->fetchColumn(),'pendingRedemptions'=>(int)$db->query("SELECT COUNT(*) FROM redemptions WHERE status='pending'")->fetchColumn(),'pendingPointRequests'=>(int)$db->query("SELECT COUNT(*) FROM point_requests WHERE status='pending'")->fetchColumn(),'activeContests'=>(int)$db->query("SELECT COUNT(*) FROM contests WHERE status='active'")->fetchColumn(),'recentTransactions'=>array_map('fTx',$db->query("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10")->fetchAll())]);
        break;
    case 'employee_stats':
        $auth=requireAuth(); $db=getDB(); $uid=$auth['uid']; $som=date('Y-m-01 00:00:00');
        $pt=$db->prepare("SELECT COALESCE(SUM(points),0) FROM transactions WHERE employee_id=?"); $pt->execute([$uid]);
        $mp=$db->prepare("SELECT COALESCE(SUM(points),0) FROM transactions WHERE employee_id=? AND created_at>=?"); $mp->execute([$uid,$som]);
        $pr=$db->prepare("SELECT COUNT(*) FROM point_requests WHERE employee_id=? AND status='pending'"); $pr->execute([$uid]);
        $rx=$db->prepare("SELECT * FROM transactions WHERE employee_id=? ORDER BY created_at DESC LIMIT 5"); $rx->execute([$uid]);
        $rk=$db->prepare("SELECT COUNT(*)+1 FROM(SELECT employee_id,SUM(points) p FROM transactions WHERE created_at>=? GROUP BY employee_id HAVING p>(SELECT COALESCE(SUM(points),0) FROM transactions WHERE employee_id=? AND created_at>=?))a"); $rk->execute([$som,$uid,$som]);
        respond(['totalPoints'=>(int)$pt->fetchColumn(),'monthlyPoints'=>(int)$mp->fetchColumn(),'pendingRequests'=>(int)$pr->fetchColumn(),'currentRank'=>(int)$rk->fetchColumn(),'recentTransactions'=>array_map('fTx',$rx->fetchAll())]);
        break;
    case 'reports':
        requireAdmin(); $db=getDB();
        respond(['byCategory'=>$db->query("SELECT category,SUM(points) total FROM transactions WHERE points>0 GROUP BY category ORDER BY total DESC")->fetchAll(),'monthlyTrend'=>$db->query("SELECT DATE_FORMAT(created_at,'%Y-%m') month,SUM(points) total FROM transactions WHERE points>0 AND created_at>=DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY month ORDER BY month")->fetchAll(),'topPerformers'=>$db->query("SELECT u.name,u.position,COALESCE(SUM(t.points),0) total_points FROM users u LEFT JOIN transactions t ON t.employee_id=u.id AND t.points>0 WHERE u.role='employee' GROUP BY u.id ORDER BY total_points DESC LIMIT 10")->fetchAll()]);
        break;
    default: respondError('Invalid action',404);
}
