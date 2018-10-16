<?php
    require '../db/db.php';

    // Get the body content encoded in json
    $bodyContent = file_get_contents('php://input');

    // Parse the json
    $request = json_decode($bodyContent);

    if ($request == NULL) {
        http_response_code(400);
        return;
    }

    if (!is_string($request->username) || !is_string($request->password)) {
        http_response_code(400);
        return;
    }

    $request->username = strtolower($request->username);
    
    $db = new Db();
    $statement = $db->prepare("SELECT `id`, `username`, `password`, `email`, `token`
                            FROM `users`
                            WHERE `username` = :username
                            LIMIT 1;");
    $statement->execute(array(
        ":username" => $request->username
    ));
    if (!($user = $statement->fetch()) || !password_verify($request->password, $user['password'])) {
        echo json_encode((object)array('result' => 'invalid_info'));
        return;
    }

    if ($user['token'] != NULL) {
        echo json_encode((object)array('result' => 'need_validation'));
        return;
    }
    $generatedToken = random_str(60);
    $statement = $db->prepare("INSERT INTO `session_tokens` (`token`, `userId`, `expire`, `creationDate`, `userAgent`, `ip`) VALUES (:token, :userId, NOW() + INTERVAL 1 DAY, NOW(), :userAgent, :ip)");
    $statement->execute(array(
        ":token" => $generatedToken,
        ":userId" => $user['id'],
        ":userAgent" => substr($_SERVER['HTTP_USER_AGENT'], 0, 200),
        ":ip" => $_SERVER['REMOTE_ADDR']
    ));

    echo json_encode((object)array('id' => $user['id'], 'username' => $user['username'], 'email' => $user['email'], 'session_token' => $generatedToken));
    return;

    function random_str($length)
    {
        $input = "0123456789abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXZ!@#$%^&*()_+-=~[]{}\\|;:'\"<>?,./";
        $inputlen = strlen($input);
        $output = "";
        $bytes = random_bytes($length);
        for ($i = 0; $i < $length; $i++)
        {
            $output .= $input[ord($bytes[$i]) % $inputlen];
        }
        return $output;
    }
?>