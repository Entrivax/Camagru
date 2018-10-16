<?php
    require '../db/check-user.php';
    require '../db/db.php';

    if (!isset($_SERVER['HTTP_AUTHENTICATION'])) {
        echo json_encode((object)array('result' => 'not_connected'));
        http_response_code(401);
        return;
    }
    
    $db = new Db();
    $user = getUser($db, false);

    if (!$user) {
        echo json_encode((object)array('result' => 'not_connected'));
        http_response_code(401);
        return;
    }

    $statement = $db->prepare("SELECT *
                                FROM `session_tokens`
                                WHERE `userId` = :userId;");
    $statement->execute(array(
        ":userId" => $user['userId']
    ));

    echo json_encode((object)array(
        'tokens' => extractTokenInfos($statement->fetchAll())
    ));
    return;


    function extractTokenInfos($tokens) {
        $newArray = array();
        $tokensCount = count($tokens);
        for ($i = 0; $i < $tokensCount; $i++) {
            array_push($newArray, (object)array(
                'token' => $tokens[$i]['token'],
                'creationDate' => $tokens[$i]['creationDate'],
                'expire' => $tokens[$i]['expire'],
                'userAgent' => $tokens[$i]['userAgent'],
                'ip' => $tokens[$i]['ip'],
            ));
        }

        return $newArray;
    }
?>