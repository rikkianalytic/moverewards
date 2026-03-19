<?php
require_once 'config.php';
require_once 'email.php';
$action=$_GET['action']??''; $body=getBody();

function fTx($t){return['id'=>$t['id'],'employeeId'=>$t['employee_id'],'employeeName'=>$t['employee_name'],'points'=>(int)$t['points'],'category'=>$t['category'],'notes'=>$t['notes']??'','adminId'=>$t['admin_id'],'createdAt'=>$t['created_at']];}
function fReq($r){return['id'=>$r['id'],'employeeId'=>$r['employee_id'],'employeeName'=>$r['employee_name'],'points'=>(int)$r['points'],'category'=>$r['category'],'notes'=>$r['notes']??'','status'=>$r['status'],'createdAt'=>$r['created_at'],'processedAt'=>$r['processed_at']];}

switch($action){
    case 'history':
        $auth=requireAuth(); $db=getDB();
        $eid=$_GET['employee_id']??null;
        if($auth['role']==='employee') $eid=$auth['uid'];
        if($eid){$st=$db->prepare("SELECT * FROM transactions WHERE employee_id=? ORDER BY created_at DESC");$st->execute([$eid]);}
        else{$st=$db->query("SELECT * FROM transactions ORDER BY created_at DESC");}
        respond(array_map('fTx',$st->fetchAll())); break;

    case 'add':
        $auth=requireAdmin(); $db=getDB();
        $eid=$body['employeeId']??''; $pts=(int)($body['points']??0); $cat=$body['category']??'';
        if(!$eid||!$pts||!$cat) respondError('employeeId, points, category required');
        $st=$db->prepare("SELECT name, email FROM users WHERE id=?"); $st->execute([$eid]);
        $emp=$st->fetch(); if(!$emp) respondError('Employee not found');
        $id=genId('tx');
        $db->prepare("INSERT INTO transactions (id,employee_id,employee_name,points,category,notes,admin_id) VALUES (?,?,?,?,?,?,?)")
           ->execute([$id,$eid,$emp['name'],$pts,$cat,$body['notes']??'',$auth['uid']]);
        // Send email notification if points > 0
        if($pts > 0 && !empty($emp['email'])) {
            @emailPointsAwarded($emp['name'], $emp['email'], $pts, $cat, $body['notes']??'');
        }
        respond(['message'=>'Points updated successfully','id'=>$id]); break;

    case 'categories':
        requireAuth();
        respond(getDB()->query("SELECT name FROM categories ORDER BY name")->fetchAll(PDO::FETCH_COLUMN)); break;

    case 'add_category':
        requireAdmin(); $name=trim($body['category']??''); if(!$name) respondError('Category name required');
        $db=getDB(); $db->prepare("INSERT IGNORE INTO categories (name) VALUES (?)")->execute([$name]);
        respond($db->query("SELECT name FROM categories ORDER BY name")->fetchAll(PDO::FETCH_COLUMN)); break;

    case 'delete_category':
        requireAdmin(); $db=getDB();
        $db->prepare("DELETE FROM categories WHERE name=?")->execute([$body['category']??'']);
        respond($db->query("SELECT name FROM categories ORDER BY name")->fetchAll(PDO::FETCH_COLUMN)); break;

    case 'requests':
        $auth=requireAuth(); $db=getDB();
        if($auth['role']==='admin'){$rows=$db->query("SELECT * FROM point_requests ORDER BY created_at DESC")->fetchAll();}
        else{$st=$db->prepare("SELECT * FROM point_requests WHERE employee_id=? ORDER BY created_at DESC");$st->execute([$auth['uid']]);$rows=$st->fetchAll();}
        respond(array_map('fReq',$rows)); break;

    case 'create_request':
        $auth=requireAuth(); if($auth['role']!=='employee') respondError('Only employees can submit requests');
        $pts=(int)($body['points']??0); $cat=$body['category']??'';
        if(!$pts||!$cat) respondError('Points and category required');
        $db=getDB(); $st=$db->prepare("SELECT name FROM users WHERE id=?"); $st->execute([$auth['uid']]); $emp=$st->fetch();
        $id=genId('pr');
        $db->prepare("INSERT INTO point_requests (id,employee_id,employee_name,points,category,notes,status) VALUES (?,?,?,?,?,?,'pending')")
           ->execute([$id,$auth['uid'],$emp['name'],$pts,$cat,$body['notes']??'']);
        respond(['message'=>'Request submitted successfully']); break;

    case 'handle_request':
        $auth=requireAdmin(); $rid=$body['requestId']??''; $status=$body['status']??'';
        if(!$rid||!in_array($status,['approved','declined'])) respondError('requestId and valid status required');
        $db=getDB(); $st=$db->prepare("SELECT * FROM point_requests WHERE id=?"); $st->execute([$rid]);
        $req=$st->fetch(); if(!$req) respondError('Request not found');
        $db->prepare("UPDATE point_requests SET status=?,processed_at=NOW() WHERE id=?")->execute([$status,$rid]);
        if($status==='approved'){
            $txId=genId('tx');
            $db->prepare("INSERT INTO transactions (id,employee_id,employee_name,points,category,notes,admin_id) VALUES (?,?,?,?,?,?,?)")
               ->execute([$txId,$req['employee_id'],$req['employee_name'],$req['points'],$req['category'],'Approved: '.$req['notes'],$auth['uid']]);
        }
        // Send email to employee
        $empSt=$db->prepare("SELECT email FROM users WHERE id=?"); $empSt->execute([$req['employee_id']]);
        $empData=$empSt->fetch();
        if($empData) @emailPointRequestProcessed($req['employee_name'],$empData['email'],(int)$req['points'],$req['category'],$status);
        respond(['message'=>'Request '.$status.' successfully']); break;

    default: respondError('Invalid action',404);
}
