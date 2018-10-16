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

    if ($request == NULL || !isset($request->password) || !isset($request->newEmail)) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'incomplete_info'));
        return;
    }

    if (!filter_var($request->newEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'invalid_email'));
        return;
    }

    if (!password_verify($request->password, $user['password'])) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'invalid_password'));
        return;
    }

    $request->newEmail = strtolower($request->newEmail);

    $statement = $db->prepare("SELECT `email` FROM `users` WHERE `email` = :email");
    $statement->execute(array(
        ':email' => $request->newEmail,
    ));

    if ($statement->fetch()) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'email_taken'));
        return;
    }

    $statement = $db->prepare("UPDATE `users` SET `email` = :email WHERE `id` = :id");
    $statement->execute(array(
        ':id' => $user["userId"],
        ':email' => $request->newEmail,
    ));

    echo json_encode((object)array('result' => 'ok'));
?>