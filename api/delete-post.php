<?php
    require '../db/db.php';
    require '../db/check-user.php';
    header('Content-type:application/json;charset=utf-8');
    $outputDir = '../usr/';
    
    $db = new Db();
    $user = getUser($db);

    if (!$user) {
        http_response_code(401);
        return;
    }

    if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
        http_response_code(400);
        return;
    }

    $statement = $db->prepare("SELECT `userId`, `fileName`
                                FROM `posts`
                                WHERE `id` = :id;");
    $statement->execute(array(
        ':id' => (int)$_GET["id"],
    ));
    $post = $statement->fetch();

    if ($post["userId"] == $user["userId"]) {
        $statement = $db->prepare("DELETE FROM `posts` WHERE `id` = :id");
        $statement->execute(array(
            ':id' => (int)$_GET["id"],
        ));
        unlink($outputDir . $post["fileName"]);
        echo json_encode((object)array('result' => 'ok'));
        return;
    }

    http_response_code(403);
    return;
?>