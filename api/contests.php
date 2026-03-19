<?php
require_once 'config.php';
require_once 'email.php';
$action=$_GET['action']??''; $body=getBody();
function fC($c){return['id'=>$c['id'],'name'=>$c['name'],'description'=>$c['description']??'','startDate'=>$c['start_date'],'endDate'=>$c['end_date'],'criteriaType'=>$c['criteria_type'],'categoryFilter'=>$c['category_filter']??'','prizeType'=>$c['prize_type'],'prizeValue'=>(int)$c['prize_value'],'assignedEmployeeIds'=>json_decode($c['assigned_employee_ids']??'[]',true)??[],'status'=>$c['status']];}
switch($action){
    case 'list': requireAuth(); respond(array_map('fC',getDB()->query("SELECT * FROM contests ORDER BY created_at DESC")->fetchAll())); break;
    case 'create':
        requireAdmin(); $name=$body['name']??''; $sd=$body['startDate']??''; $ed=$body['endDate']??'';
        if(!$name||!$sd||!$ed) respondError('Name, startDate, endDate required');
        $id=genId('c');
        $assignedIds = $body['assignedEmployeeIds']??[];
        getDB()->prepare("INSERT INTO contests (id,name,description,start_date,end_date,criteria_type,category_filter,prize_type,prize_value,assigned_employee_ids,status) VALUES (?,?,?,?,?,?,?,?,?,?,'active')")
               ->execute([$id,$name,$body['description']??'',$sd,$ed,$body['criteriaType']??'points',$body['categoryFilter']??'',$body['prizeType']??'points',(int)($body['prizeValue']??0),json_encode($assignedIds)]);
        // Send email notifications to assigned employees
        if(!empty($assignedIds)) {
            $db = getDB();
            foreach($assignedIds as $empId) {
                $st=$db->prepare("SELECT name,email FROM users WHERE id=?"); $st->execute([$empId]);
                $emp=$st->fetch();
                if($emp) @emailContestInvite($emp['name'],$emp['email'],$name,date('M d, Y',strtotime($ed)),(int)($body['prizeValue']??0));
            }
        }
        respond(['message'=>"Contest created! Notifications sent to ".count($assignedIds)." employees.",'id'=>$id]); break;
    case 'update':
        requireAdmin(); $id=$body['id']??''; if(!$id) respondError('ID required');
        $db=getDB(); $f=[]; $p=[];
        $map=['name'=>'name','description'=>'description','startDate'=>'start_date','endDate'=>'end_date','criteriaType'=>'criteria_type','categoryFilter'=>'category_filter','prizeType'=>'prize_type','prizeValue'=>'prize_value','status'=>'status'];
        foreach($map as $j=>$d){if(isset($body[$j])){$f[]="$d=?";$p[]=$body[$j];}}
        if(isset($body['assignedEmployeeIds'])){$f[]="assigned_employee_ids=?";$p[]=json_encode($body['assignedEmployeeIds']);}
        if(empty($f)) respondError('No fields to update');
        $p[]=$id; $db->prepare("UPDATE contests SET ".implode(',',$f)." WHERE id=?")->execute($p);
        respond(['message'=>'Contest updated successfully']); break;
    case 'delete':
        requireAdmin(); $id=$body['id']??''; if(!$id) respondError('ID required');
        getDB()->prepare("DELETE FROM contests WHERE id=?")->execute([$id]);
        respond(['message'=>'Contest deleted']); break;
    default: respondError('Invalid action',404);
}
