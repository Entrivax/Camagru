<?php
    require '../db/check-user.php';
    require '../db/db.php';

    if (!isset($_SERVER['HTTP_AUTHENTICATION'])) {
        echo json_encode((object)array('result' => 'not_connected'));
        return;
    }
    
    $db = new Db();
    $user = getUser($db, true);

    if (!$user) {
        echo json_encode((object)array('result' => 'not_connected'));
        return;
    }

    echo json_encode((object)array(
        'id' => $user['userId'],
        'username' => $user['username'],
        'email' => $user['email'],
        'sendMailOnComment' => $user['sendMailOnComment'],
    ));
    return;
?>