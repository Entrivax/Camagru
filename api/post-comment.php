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

    if ($request == NULL || !isset($request->id) || !is_numeric($request->id) || !isset($request->comment) || !is_string($request->comment)) {
        http_response_code(400);
        return;
    }
    
    $request->comment = trim($request->comment);

    $commentLen = strlen($request->comment);
    if ($commentLen == 0 || $commentLen > 512) {
        http_response_code(400);
        return;
    }

    $statement = $db->prepare("INSERT INTO `comments` (`postId`, `userId`, `comment`, `date`)
                                            VALUES (:postId, :userId, :comment, NOW());");
    $statement->execute(array(
        ':postId' => $request->id,
        ':userId' => $user['userId'],
        ':comment' => $request->comment
    ));

    $statement = $db->prepare("SELECT `users`.`email`,
                                    `users`.`username`,
                                    `users`.`sendMailOnComment`,
                                    `users`.`id`
                                FROM `posts`
                                INNER JOIN `users` ON `posts`.`userId` = `users`.`id`
                                WHERE `posts`.`id` = :postId;");
    $statement->execute(array(
        ':postId' => $request->id
    ));
    $author = $statement->fetch();
    $authorUsername = $author['username'];
    if ($author['sendMailOnComment'] && $user['userId'] != $author['id']) {
        mail($author['email'], "New comment on Camagru!", "Hello $authorUsername,

A new comment was left on your post!");
    }

    echo json_encode((object)array('result' => 'ok'));
    return;
?>