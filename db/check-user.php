<?php

    function getUser($db, $fullUser = false) {
        if (!isset($_SERVER['HTTP_AUTHENTICATION'])) {
            return NULL;
        }
        $token = $_SERVER['HTTP_AUTHENTICATION'];
        return getUserFromToken($db, $token, $fullUser);
    }

    function getUserFromToken($db, $sessionToken, $fullUser) {
        $statement = $db->prepare("DELETE FROM `session_tokens` WHERE `expire` < NOW();");
        $statement->execute(array());
        if (!$fullUser) {
            $statement = $db->prepare("SELECT `token`, `userId`
                                FROM `session_tokens`
                                WHERE `token` = :sessionToken
                                LIMIT 1;");
            $statement->execute(array(
                ":sessionToken" => $sessionToken
            ));
        } else {
            $statement = $db->prepare("SELECT `session_tokens`.`userId`,
                                                `users`.`username`,
                                                `users`.`email`,
                                                `users`.`creationDate`,
                                                `users`.`password`,
                                                `users`.`sendMailOnComment`
                                FROM `session_tokens`
                                INNER JOIN `users` ON `users`.`id` = `session_tokens`.`userId`
                                WHERE `session_tokens`.`token` = :sessionToken
                                LIMIT 1;");
            $statement->execute(array(
                ":sessionToken" => $sessionToken
            ));
        }
        $user = $statement->fetch();

        return $user && $user['userId'] != NULL ? $user : NULL;
    }

?>