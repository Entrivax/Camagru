<?php
    require '../db/db.php';
    require '../db/check-user.php';
    header('Content-type:application/json;charset=utf-8');

    if (!isset($_GET["id"]))
    {
        http_response_code(400);
        return;
    }

    $db = new Db();

    $user = getUser($db);

    $statement = $db->prepare("SELECT
                                    `posts`.`id`,
                                    `posts`.`userId`,
                                    `posts`.`fileName`,
                                    `posts`.`date`,
                                    `users`.`username`,
                                    (COUNT(`likes`.`userId`)) AS `likes`,
                                    (SUM(CASE WHEN `likes`.`userId` = :userId THEN 1 ELSE 0 END)) AS `hasLiked`
                                FROM `posts`
                                LEFT OUTER JOIN `likes` ON `likes`.`postId` = `posts`.`id`
                                INNER JOIN `users` ON `users`.`id` = `posts`.`userId`
                                WHERE `posts`.`id` = :postId
                                ORDER BY `posts`.`id` DESC
                                LIMIT 1");
    $statement->execute(array(
        ":postId" => $_GET["id"],
        ":userId" => $user != NULL ? $user["userId"] : NULL
    ));

    $post = $statement->fetch();

    if ($post['id'] == NULL)
    {
        http_response_code(404);
        return;
    }
    
    $statement = $db->prepare("SELECT
                                    `comments`.`comment`,
                                    `comments`.`userId`,
                                    `users`.`username`,
                                    `comments`.`date`
                                FROM `comments`
                                INNER JOIN `users` ON `users`.`id` = `comments`.`userId`
                                WHERE `comments`.`postId` = :postId
                                ORDER BY `comments`.`date`");
    $statement->execute(array(
        ":postId" => $_GET["id"]
    ));
    $comments = $statement->fetchAll();

    echo (json_encode(array(
        'id' => (int)$post['id'],
        'userId' => (int)$post['userId'],
        'fileName' => $post['fileName'],
        'date' => $post['date'],
        'username' => $post['username'],
        'likes' => (int)$post['likes'],
        'hasLiked' => $user == NULL ? NULL : $post['hasLiked'] == '1',
        'isOwnPost' => $user['userId'] == (int)$post['userId'],
        'comments' => convertComments($comments)
    )));

    function convertComments($comments) {
        $newArray = array();
        $commentsCount = count($comments);
        for ($i = 0; $i < $commentsCount; $i++) {
            array_push($newArray, (object)array(
                'username' => $comments[$i]['username'],
                'userId' => (int)$comments[$i]['userId'],
                'comment' => $comments[$i]['comment'],
                'date' => $comments[$i]['date'],
            ));
        }
        return $newArray;
    }
?>