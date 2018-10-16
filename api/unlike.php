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

    if ($request == NULL || !isset($request->id) || !is_numeric($request->id)) {
        http_response_code(400);
        return;
    }
    
    $statement = $db->prepare("DELETE FROM `likes`
                                        WHERE `postId` = :postId AND `userId` = :userId;");
    $statement->execute(array(
        ':postId' => $request->id,
        ':userId' => $user['userId']
    ));

    $statement = $db->prepare("SELECT COUNT(*)
                                FROM `likes`
                                WHERE `postId` = :postId;");
    $statement->execute(array(
        ':postId' => $request->id
    ));

    echo json_encode((object)array('result' => 'ok', 'likes' => $statement->fetchColumn()));
    return;
?>