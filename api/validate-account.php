<?php
    require '../db/db.php';
    header('Content-type:application/json;charset=utf-8');

    $homeUrl = (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : $_SERVER["REQUEST_SCHEME"]) . '://' . $_SERVER['HTTP_HOST'] . get_parent_url(get_parent_url($_SERVER["REQUEST_URI"])) . "/#/";
    if (isset($_GET["token"]))
    {
        $token = $_GET["token"];
        $db = new Db();
        $statement = $db->prepare("SELECT COUNT(*) FROM `users` WHERE `token` = :token");
        $statement->execute(array(
            ':token' => $token,
        ));
        $result = $statement->fetchColumn();
        if ($result > 0)
        {
            $statement = $db->prepare("UPDATE `users` SET `token` = NULL WHERE `token` = :token");
            $statement->execute(array(
                ':token' => $token,
            ));
            header("Location: " . $homeUrl . "accountValidated");
            exit;
        }
        header("Location: " . $homeUrl . "invalidToken");
        exit;
    }

    header("Location: " . $homeUrl);

    function get_parent_url($url)
    {
        $levels = explode("/", $url);
        array_pop($levels);
        return (implode("/", $levels));
    }
?>