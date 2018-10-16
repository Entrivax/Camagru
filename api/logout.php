<?php
    require '../db/db.php';
    header('Content-type:application/json;charset=utf-8');

    if (!isset($_SERVER['HTTP_AUTHENTICATION'])) {
        return json_encode((object)array('result' => 'no_token'));;
    }

    $db = new Db();
    
    $statement = $db->prepare("DELETE FROM `session_tokens` WHERE `token` = :token");
    $statement->execute(array(
        ":token" => $_SERVER['HTTP_AUTHENTICATION']
    ));
    
    echo json_encode((object)array('result' => 'ok'));
    return;
?>