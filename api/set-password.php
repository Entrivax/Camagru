<?php
    require '../db/db.php';
    require '../db/check-user.php';
    header('Content-type:application/json;charset=utf-8');

    $db = new Db();

    $user = getUser($db, true);

    if (!$user) {
        http_response_code(401);
        return;
    }

    // Get the body content encoded in json
    $bodyContent = file_get_contents('php://input');

    // Parse the json
    $request = json_decode($bodyContent);

    if ($request == NULL || !isset($request->password) || !isset($request->newPassword) || !is_string($request->newPassword)) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'incomplete_info'));
        return;
    }

    if (strlen($request->newPassword) < 8) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'insecure_new_password'));
        return;
    }

    if (!password_verify($request->password, $user['password'])) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'invalid_password'));
        return;
    }
    
    $statement = $db->prepare("UPDATE `users` SET `password` = :pass WHERE `id` = :id");
    $statement->execute(array(
        ':id' => $user["userId"],
        ':pass' => password_hash($request->newPassword, PASSWORD_DEFAULT),
    ));

    echo json_encode((object)array('result' => 'ok'));
?>