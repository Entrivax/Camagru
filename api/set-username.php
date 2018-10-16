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

    if ($request == NULL || !isset($request->password) || !isset($request->username)) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'incomplete_info'));
        return;
    }

    if (!is_string($request->username) || strlen($request->username) < 3 || strlen($request->username) > 24) {
        echo json_encode((object)array('result' => 'invalid_username'));
        return;
    }

    if (!password_verify($request->password, $user['password'])) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'invalid_password'));
        return;
    }
    
    $request->username = strtolower($request->username);

    $statement = $db->prepare("SELECT `username` FROM `users` WHERE `username` = :username");
    $statement->execute(array(
        ':username' => $request->username,
    ));

    if ($statement->fetch()) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'username_taken'));
        return;
    }

    $statement = $db->prepare("UPDATE `users` SET `username` = :username WHERE `id` = :id");
    $statement->execute(array(
        ':id' => $user["userId"],
        ':username' => $request->username,
    ));

    echo json_encode((object)array('result' => 'ok'));
?>