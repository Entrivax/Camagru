<?php
    require '../db/db.php';
    header('Content-type:application/json;charset=utf-8');

    // Get the body content encoded in json
    $bodyContent = file_get_contents('php://input');

    // Parse the json
    $request = json_decode($bodyContent);

    if ($request == NULL) {
        http_response_code(400);
        return;
    }

    if (!is_string($request->username) || strlen($request->username) < 3 || strlen($request->username) > 24) {
        echo json_encode((object)array('result' => 'invalid_username'));
        return;
    }
    
    if (!is_string($request->email) || !filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode((object)array('result' => 'invalid_email'));
        return;
    }

    if (!is_string($request->password) || strlen($request->password) < 8) {
        echo json_encode((object)array('result' => 'invalid_password'));
        return;
    }

    $request->username = strtolower($request->username);
    $request->email = strtolower($request->email);

    $db = new Db();
    $statement = $db->prepare("SELECT sum(case when email=:email then 1 else 0 end) as email, sum(case when username=:username then 1 else 0 end) as username FROM `users`");
    $statement->execute(array(
        ':username' => $request->username,
        ':email' => $request->email
    ));
    $result = $statement->fetch();
    if ($result['username']) {
        echo json_encode((object)array('result' => 'username_taken'));
        return;
    }
    if ($result['email']) {
        echo json_encode((object)array('result' => 'email_taken'));
        return;
    }

    $token = random_str(60);
    $statement = $db->prepare("INSERT INTO `users` (`username`, `email`, `password`, `token`) VALUES (:username, :email, :pass, :token)");
    $statement->execute(array(
        ':username' => $request->username,
        ':email' => $request->email,
        ':pass' => password_hash($request->password, PASSWORD_DEFAULT),
        ':token' => $token
    ));

    mail($request->email, "Camagru account validation", "
Hello $request->username,

You need to validate your account with this link: " . (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : $_SERVER["REQUEST_SCHEME"]) . '://' . $_SERVER["HTTP_HOST"] . get_parent_url($_SERVER["REQUEST_URI"]) . "/validate-account.php?token=$token

Thank you.
");

    echo json_encode((object)array('result' => 'ok'));
    return;

    function random_str($length)
    {
        $input = "0123456789abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXZ";
        $inputlen = strlen($input);
        $output = "";
        $bytes = random_bytes($length);
        for ($i = 0; $i < $length; $i++)
        {
            $output .= $input[ord($bytes[$i]) % $inputlen];
        }
        return $output;
    }

    function get_parent_url($url)
    {
        $levels = explode("/", $url);
        array_pop($levels);
        return (implode("/", $levels));
    }
?>