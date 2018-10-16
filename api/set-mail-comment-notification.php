<?php
    require '../db/db.php';
    require '../db/check-user.php';
    header('Content-type:application/json;charset=utf-8');

    $db = new Db();

    $user = getUser($db);

    if (!$user) {
        http_response_code(401);
        return;
    }

    // Get the body content encoded in json
    $bodyContent = file_get_contents('php://input');

    // Parse the json
    $request = json_decode($bodyContent);

    if ($request == NULL || !isset($request->sendMailOnComment) || !is_bool($request->sendMailOnComment)) {
        http_response_code(400);
        echo json_encode((object)array('result' => 'incomplete_info'));
        return;
    }
    
    $statement = $db->prepare("UPDATE `users` SET `sendMailOnComment` = :sendMailOnComment WHERE `id` = :id");
    $statement->execute(array(
        ':id' => $user["userId"],
        ':sendMailOnComment' => $request->sendMailOnComment ? 1 : 0,
    ));

    echo json_encode((object)array('result' => 'ok'));
?>