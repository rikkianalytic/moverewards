<?php
require_once 'config.php';
require_once 'email.php';
$action=$_GET['action']??''; $body=getBody();
function fRw($r){return['id'=>$r['id'],'name'=>$r['name'],'description'=>$r['description']??'','pointsRequired'=>(int)$r['points_required'],'status'=>$r['status'],'couponCode'=>$r['coupon_code']??'','howToUse'=>$r['how_to_use']??''];}
function fRed($r){return['id'=>$r['id'],'employeeId'=>$r['employee_id'],'employeeName'=>$r['employee_name'],'rewardId'=>$r['reward_id'],'rewardName'=>$r['reward_name'],'pointsValue'=>(int)$r['points_value'],'status'=>$r['status'],'dateRequested'=>$r['date_requested'],'dateApproved'=>$r['date_approved']];}
switch($action){
    case 'list': requireAuth(); respond(array_map('fRw',getDB()->query("SELECT * FROM rewards ORDER BY points_required")->fetchAll())); break;
    case 'create':
        requireAdmin(); $name=$body['name']??''; $pts=(int)($body['pointsRequired']??0);
        if(!$name||!$pts) respondError('Name and pointsRequired required');
        $id=genId('r');
        getDB()->prepare("INSERT INTO rewards (id,name,description,points_required,coupon_code,how_to_use,status) VALUES (?,?,?,?,?,?,'active')")
               ->execute([$id,$name,$body['description']??'',$pts,$body['couponCode']??'',$body['howToUse']??'']);
        respond(['message'=>'Reward created successfully','id'=>$id]); break;
    case 'update':
        requireAdmin(); $id=$body['id']??''; if(!$id) respondError('ID required');
        $db=getDB(); $f=[]; $p=[];
        $map=['name'=>'name','description'=>'description','pointsRequired'=>'points_required','status'=>'status','couponCode'=>'coupon_code','howToUse'=>'how_to_use'];
        foreach($map as $j=>$d){if(isset($body[$j])){$f[]="$d=?";$p[]=$body[$j];}}
        if(empty($f)) respondError('No fields to update');
        $p[]=$id; $db->prepare("UPDATE rewards SET ".implode(',',$f)." WHERE id=?")->execute($p);
        respond(['message'=>'Reward updated successfully']); break;
    case 'redeem':
        $auth=requireAuth(); if($auth['role']!=='employee') respondError('Only employees can redeem');
        $rid=$body['rewardId']??''; if(!$rid) respondError('rewardId required');
        $db=getDB();
        $rwSt=$db->prepare("SELECT * FROM rewards WHERE id=? AND status='active'"); $rwSt->execute([$rid]); $rw=$rwSt->fetch();
        if(!$rw) respondError('Reward not found or inactive');
        $empSt=$db->prepare("SELECT name,email FROM users WHERE id=?"); $empSt->execute([$auth['uid']]); $emp=$empSt->fetch();
        $balSt=$db->prepare("SELECT COALESCE(SUM(points),0) FROM transactions WHERE employee_id=?"); $balSt->execute([$auth['uid']]);
        $bal=(int)$balSt->fetchColumn();
        if($bal<$rw['points_required']) respondError("Insufficient points. You have $bal pts, need {$rw['points_required']}");
        $redId=genId('red');
        $db->prepare("INSERT INTO redemptions (id,employee_id,employee_name,reward_id,reward_name,points_value,status,date_approved) VALUES (?,?,?,?,?,?,'approved',NOW())")
           ->execute([$redId,$auth['uid'],$emp['name'],$rid,$rw['name'],$rw['points_required']]);
        $txId=genId('tx');
        $db->prepare("INSERT INTO transactions (id,employee_id,employee_name,points,category,notes,admin_id) VALUES (?,?,?,?,'Reward Redemption',?,'system')")
           ->execute([$txId,$auth['uid'],$emp['name'],-$rw['points_required'],'Redeemed: '.$rw['name']]);
        // Send email
        if($emp) @emailRewardApproved($emp['name'],$emp['email'],$rw['name'],$rw['coupon_code']??'');
        respond(['message'=>'Reward redeemed successfully!','couponCode'=>$rw['coupon_code']??'']); break;
    case 'redemptions':
        $auth=requireAuth(); $db=getDB();
        if($auth['role']==='admin'){$rows=$db->query("SELECT * FROM redemptions ORDER BY date_requested DESC")->fetchAll();}
        else{$st=$db->prepare("SELECT * FROM redemptions WHERE employee_id=? ORDER BY date_requested DESC");$st->execute([$auth['uid']]);$rows=$st->fetchAll();}
        respond(array_map('fRed',$rows)); break;
    case 'handle_redemption':
        requireAdmin(); $id=$body['id']??''; $status=$body['status']??'';
        if(!$id||!in_array($status,['approved','denied'])) respondError('id and valid status required');
        $db=getDB(); $st=$db->prepare("SELECT * FROM redemptions WHERE id=? AND status='pending'"); $st->execute([$id]); $red=$st->fetch();
        if(!$red) respondError('Redemption not found or already processed');
        $db->prepare("UPDATE redemptions SET status=?,date_approved=NOW() WHERE id=?")->execute([$status,$id]);
        if($status==='approved'){
            // Get reward details for email
            $rwSt=$db->prepare("SELECT coupon_code FROM rewards WHERE id=?"); $rwSt->execute([$red['reward_id']]); $rw=$rwSt->fetch();
            $empSt=$db->prepare("SELECT email FROM users WHERE id=?"); $empSt->execute([$red['employee_id']]); $empData=$empSt->fetch();
            if($empData) @emailRewardApproved($red['employee_name'],$empData['email'],$red['reward_name'],$rw['coupon_code']??'');
        }
        respond(['message'=>'Redemption '.$status.' successfully']); break;
    default: respondError('Invalid action',404);
}
