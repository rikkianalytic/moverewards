<?php
require_once 'config.php';
$action=$_GET['action']??''; $body=getBody();
function fN($n){return['id'=>$n['id'],'userId'=>$n['user_id'],'userName'=>$n['user_name'],'title'=>$n['title'],'content'=>$n['content']??'','type'=>$n['type'],'isPublic'=>(bool)$n['is_public'],'color'=>$n['color']??'','createdAt'=>$n['created_at']];}
switch($action){
    case 'list':
        $auth=requireAuth(); $db=getDB();
        $st=$db->prepare("SELECT * FROM notes WHERE user_id=? OR is_public=1 ORDER BY created_at DESC");
        $st->execute([$auth['uid']]); respond(array_map('fN',$st->fetchAll())); break;
    case 'create':
        $auth=requireAuth(); $title=$body['title']??''; if(!$title) respondError('Title chahiye');
        $db=getDB(); $st=$db->prepare("SELECT name FROM users WHERE id=?"); $st->execute([$auth['uid']]); $u=$st->fetch();
        $id=genId('note');
        $db->prepare("INSERT INTO notes (id,user_id,user_name,title,content,type,is_public,color) VALUES (?,?,?,?,?,?,?,?)")
           ->execute([$id,$auth['uid'],$u['name'],$title,$body['content']??'',$body['type']??'note',$body['isPublic']?1:0,$body['color']??'']);
        respond(['message'=>'Note bana','id'=>$id]); break;
    case 'delete':
        $auth=requireAuth(); $id=$body['id']??'';
        getDB()->prepare("DELETE FROM notes WHERE id=? AND user_id=?")->execute([$id,$auth['uid']]);
        respond(['message'=>'Delete ho gaya']); break;
    default: respondError('Invalid action',404);
}
