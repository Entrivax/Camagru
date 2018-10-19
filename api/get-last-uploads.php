<?php
    require '../db/db.php';
    header('Content-type:application/json;charset=utf-8');
    $numberToLoadByCall = 10;

    $db = new Db();

    if (isset($_GET["count"]) && is_numeric($_GET["count"]))
    {
        $count = (int)$_GET["count"];
        if ($count > 0 && $count < 20)
        {
            $numberToLoadByCall = $count;
        }
    }

    if (isset($_GET["lastId"]))
    {
        $statement = $db->prepare("SELECT
                                        `posts`.`id`,
                                        `posts`.`userId`,
                                        `posts`.`fileName`,
                                        `posts`.`date`,
                                        `users`.`username`
                                    FROM `posts`
                                    INNER JOIN `users` ON `users`.`id` = `posts`.`userId`
                                    WHERE `posts`.`id` < :lastId
                                    ORDER BY `posts`.`id` DESC
                                    LIMIT 0,$numberToLoadByCall;");
        $statement->execute(array(
            ":lastId" => $_GET["lastId"]
        ));
        echo (json_encode(convert_posts($statement->fetchAll())));
    }
    else
    {
        $statement = $db->prepare("SELECT
                                        `posts`.`id`,
                                        `posts`.`userId`,
                                        `posts`.`fileName`,
                                        `posts`.`date`,
                                        `users`.`username`
                                    FROM `posts`
                                    INNER JOIN `users` ON `users`.`id` = `posts`.`userId`
                                    ORDER BY `posts`.`id` DESC
                                    LIMIT 0,$numberToLoadByCall;");
        $statement->execute(array());
        echo (json_encode(convert_posts($statement->fetchAll())));
    }

    function convert_posts($posts) {
        $newArray = array();
        $postsCount = count($posts);
        for ($i = 0; $i < $postsCount; $i++) {
            array_push($newArray, (object)array(
                'id' => $posts[$i]['id'],
                'userId' => $posts[$i]['userId'],
                'fileName' => $posts[$i]['fileName'],
                'date' => $posts[$i]['date'],
                'username' => $posts[$i]['username'],
            ));
        }
        return $newArray;
    }
?>