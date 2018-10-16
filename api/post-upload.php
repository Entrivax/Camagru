<?php
    require '../db/check-user.php';
    require '../db/db.php';
    //header('Content-type:application/json;charset=utf-8');
    $outputDir = '../usr/';
    
    $db = new Db();
    $user = getUser($db);

    if (!$user) {
        http_response_code(401);
        return;
    }

    if (!isset($_FILES['imageData']) || !isset($_POST['args'])) {
        http_response_code(400);
        return;
    }

    // Parse the json
    $request = json_decode($_POST['args']);

    if ($request == NULL) {
        echo('Error: not parsable input');
        http_response_code(400);
        return;
    }

    if (!isset($request->effects)) {
        echo('Error: bad object data');
        http_response_code(400);
        return;
    }

    if (($img = openImage($_FILES['imageData']['tmp_name'])) == FALSE) {
        echo('Error: cannot create image from source');
        http_response_code(400);
        return;
    }

    $imagesConfig = json_decode(file_get_contents("../images/config.php"))->images;
    for ($i = 0; $i < count($request->effects); $i++) {
        $effect = $request->effects[$i];
        if (count($imagesConfig) <= $effect->id) {
            echo('Error: effect out of bounds');
            http_response_code(400);
            return;
        }

        $isJpeg = exif_imagetype($_FILES['imageData']['tmp_name']) == IMAGETYPE_JPEG;
        $imgToStack = openImage("../images/" . $imagesConfig[$effect->id]->file);
        $srcSize = array(imagesx($img), imagesy($img));
        $stackSize = array(imagesx($imgToStack), imagesy($imgToStack));
    
        //imagecopyresized ( resource $dst_image , resource $src_image ,
        //      int $dst_x , int $dst_y ,
        //      int $src_x , int $src_y ,
        //      int $dst_w , int $dst_h ,
        //      int $src_w , int $src_h )
        imagecopyresized($img, $imgToStack,
                $srcSize[0] * $effect->x / 100.0, $srcSize[1] * $effect->y / 100.0,
                0, 0,
                $srcSize[0] * $effect->width / 100.0, $srcSize[1] * $effect->height / 100.0,
                $stackSize[0], $stackSize[1]);
    }


    $fileName = (time()) . $user["userId"] . random_str(13);

    imagealphablending($img, false);
    imagesavealpha($img, true);
    if ($isJpeg)
        imagejpeg($img, $outputDir . $fileName, 92);
    else
        imagepng($img, $outputDir . $fileName);

    $statement = $db->prepare("INSERT INTO `posts` (`userId`, `fileName`) VALUES (:userId, :fname)");
    $statement->execute(array(
        ':userId' => $user["userId"],
        ':fname' => $fileName,
    ));
    
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

    function openImage($src)
    {
        return imagecreatefromstring(file_get_contents($src));
    }
?>