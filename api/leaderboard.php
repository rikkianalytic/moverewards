<?php
require_once 'config.php';
requireAuth();
$som=date('Y-m-01 00:00:00');
$st=getDB()->prepare("SELECT u.id,u.name,u.position,COALESCE(SUM(t.points),0) lp,COALESCE(SUM(CASE WHEN t.created_at>=? THEN t.points ELSE 0 END),0) mp FROM users u LEFT JOIN transactions t ON t.employee_id=u.id WHERE u.role='employee' AND u.status='active' GROUP BY u.id,u.name,u.position ORDER BY mp DESC");
$st->execute([$som]);
$rows=$st->fetchAll();
respond(array_map(fn($r,$i)=>['rank'=>$i+1,'name'=>$r['name'],'position'=>$r['position'],'monthlyPoints'=>(int)$r['mp'],'lifetimePoints'=>(int)$r['lp']],$rows,array_keys($rows)));
