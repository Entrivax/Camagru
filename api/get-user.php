<?php
    require '../db/db.php';
    header('Content-type:application/json;charset=utf-8');
    $numberToLoadByCall = 10;

    if (!isset($_GET["id"]))
    {
        http_response_code(400);
        return;
    }

    $db = new Db();

    $statement = $db->prepare("SELECT
                                    `users`.`id`,
                                    `users`.`username`,
                                    COUNT(`posts`.`id`) AS `postCount`
                            FROM `users`
                            INNER JOIN `posts` ON `posts`.`userId` = :userId
                            WHERE `users`.`id` = :userId
                            LIMIT 0,1;");
    $statement->execute(array(
        ":userId" => $_GET["id"]
    ));

    $user = $statement->fetch();

    if (!$user || $user["id"] == NULL) {
        http_response_code(404);
        return;
    }

    $statement = $db->prepare("SELECT
                                    `id`,
                                    `fileName`
                                FROM `posts`
                                WHERE `userId` = :userId
                                ORDER BY `id` DESC
                                LIMIT 0,$numberToLoadByCall;");
    $statement->execute(array(
        ":userId" => $_GET["id"]
    ));
    echo (json_encode(array(
        'id' => $user['id'],
        'username' => $user['username'],
        'postCount' => $user['postCount'],
        'posts' => convert_posts($statement->fetchAll()
    ))));

    function convert_posts($posts) {
        $newArray = array();
        $postsCount = count($posts);
        for ($i = 0; $i < $postsCount; $i++) {
            array_push($newArray, (object)array(
                'id' => $posts[$i]['id'],
                'fileName' => $posts[$i]['fileName'],
            ));
        }
        return $newArray;
    }
?>